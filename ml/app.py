from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.naive_bayes import MultinomialNB
import numpy as np
import warnings
from sklearn.exceptions import UndefinedMetricWarning

app = Flask(__name__)
CORS(app)

warnings.filterwarnings("ignore", category=UndefinedMetricWarning)


def suppress_label_warnings():
    warnings.filterwarnings(
        "ignore",
        message="Label not .* is present in all training examples",
        category=UserWarning
    )


suppress_label_warnings()

# Load the dataset
data = pd.read_csv("skills.csv")

# Ensure all skills for the same job title are combined
job_title_to_skills = {}
for _, row in data.iterrows():
    job_title = row['Job Title'].strip()
    skills = set(skill.strip().lower() for skill in row['Skills_Required'].split(','))

    if job_title in job_title_to_skills:
        job_title_to_skills[job_title].update(skills)  # Merge skills if job title is repeated
    else:
        job_title_to_skills[job_title] = skills

# Prepare training data
X = data.groupby('Job Title')['Skills_Required'].apply(lambda x: ' '.join(x)).reset_index()
y = X['Job Title'].str.split(', ')

# Vectorization
vectorizer = TfidfVectorizer()
X_transformed = vectorizer.fit_transform(X['Skills_Required'])

# Label Binarization
mlb = MultiLabelBinarizer()
y_transformed = mlb.fit_transform(y)

labels_in_training = np.any(y_transformed, axis=0)
labels_to_use = mlb.classes_[labels_in_training]
y_transformed = y_transformed[:, labels_in_training]

# Train the model
model = OneVsRestClassifier(MultinomialNB())
model.fit(X_transformed, y_transformed)


def predict_top_badges(user_input, include_skills=None, n=5):
    user_input_set = set(skill.strip().lower() for skill in user_input)
    user_input_text = ' '.join(user_input_set)
    user_input_vectorized = vectorizer.transform([user_input_text])
    probs = model.predict_proba(user_input_vectorized)[0]
    top_indices = np.argsort(probs)[::-1]

    top_badges = [(labels_to_use[i], probs[i]) for i in top_indices]

    skills_info = {}
    for badge, _ in top_badges:
        required_skills = job_title_to_skills[badge]
        matched_skills = required_skills & user_input_set
        missing_skills = required_skills - user_input_set
        skills_info[badge] = {
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'missing_count': len(missing_skills),
            'matched_count': len(matched_skills)
        }

    if include_skills:
        include_skills_set = set(skill.strip().lower() for skill in include_skills)
        top_badges = [
            badge for badge in top_badges
            if include_skills_set.issubset(skills_info[badge[0]]['missing_skills'])
        ]

    # Sorting by matched skills (descending) and missing skills (ascending)
    top_badges_sorted = sorted(
        top_badges,
        key=lambda badge: (-skills_info[badge[0]]['matched_count'], skills_info[badge[0]]['missing_count'])
    )

    top_badges_names = [badge for badge, _ in top_badges_sorted[:n]]

    return top_badges_names, skills_info


@app.route('/predict', methods=['POST'])
def predict():
    # Get input data
    data = request.get_json()
    skills = data.get('skills', [])
    additional_skills = data.get('additionalSkills', [])
    n = data.get('n', 5)

    # Predict top badges and skills info
    predicted_badges, skills_info = predict_top_badges(skills, additional_skills if additional_skills else None, n)

    # Prepare the response
    results = []
    matched_badges = []
    matched_skill = {}

    for badge in predicted_badges:
        if len(skills_info[badge]['missing_skills']) == 0:
            matched_badges.append(badge)
            matched_skill[badge] = list(skills_info[badge]['matched_skills'])
        else:
            result = {
                "jobTitle": badge,
                "matchedSkills": list(skills_info[badge]['matched_skills']),
                "missingSkills": list(skills_info[badge]['missing_skills'])
            }
            results.append(result)

    return jsonify({
        "results": results,
        "matchedBadges": matched_badges,
        "matchedSkill": matched_skill
    })


if __name__ == '__main__':
    app.run(debug=True)
