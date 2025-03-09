import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import "jspdf-autotable";

function CV({ profile }) {
  const profileId = profile?.id || "";
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/profile/${profileId}`
        );
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          console.error("Failed to fetch profile data.");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const downloadPDF = () => {
    console.log("hii");
    console.log("yo");
    const doc = new jsPDF({ format: "a4" });
    const pageWidth = 210; // A4 page width in mm
    const margin = 10;
    const textWidth = pageWidth - 2 * margin;
    let y = margin + 5;
    const lineHeight = 5;
    const maxY = 297 - margin;

    const addSection = (
      title,
      content,
      isIndented = false,
      isProjectOrExperience = false
    ) => {
      if (!content || (Array.isArray(content) && content.length === 0)) return;
      if (y + 15 > maxY) {
        doc.addPage();
        y = margin;
      }

      y += 7;
      doc.setFontSize(16);
      doc.text(title, margin, y);
      y += 2;
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, y, pageWidth - margin, y);
      y += 2;

      doc.setFontSize(10);
      const indent = isIndented ? margin + 5 : margin;

      if (typeof content === "string") {
        const splitContent = doc.splitTextToSize(content, textWidth);
        splitContent.forEach((line) => {
          if (y + lineHeight > maxY) {
            doc.addPage();
            y = margin;
          }
          y += lineHeight;
          doc.text(line, indent, y);
        });
      } else if (Array.isArray(content)) {
        content.forEach((item) => {
          if (isProjectOrExperience) {
            const [name, description] = item.split(": ");
            if (y + lineHeight > maxY) {
              doc.addPage();
              y = margin;
            }
            y += lineHeight;
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`\u2022 ${name}`, margin, y);
            doc.setFont("helvetica", "normal");
            const splitDescription = doc.splitTextToSize(
              description,
              textWidth - 5
            );
            splitDescription.forEach((line) => {
              if (y + lineHeight > maxY) {
                doc.addPage();
                y = margin;
              }
              y += lineHeight;
              doc.text(line, margin + 5, y);
            });
          } else {
            const splitContent = doc.splitTextToSize(item, textWidth);
            splitContent.forEach((line) => {
              if (y + lineHeight > maxY) {
                doc.addPage();
                y = margin;
              }
              y += lineHeight;
              doc.text(line, indent, y);
            });
          }
        });
      }
      y += 3;
    };

    const addWatermark = () => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Made from horizon", pageWidth - margin, 297 - 5, {
        align: "right",
      });
      doc.setTextColor(0);
    };

    // Add Header
    doc.setFontSize(24);
    doc.text(profileData.name, pageWidth / 2, y, { align: "center" });
    y += 9;

    // Contact Info
    doc.setFontSize(12);
    const contactInfo = [
      profileData.email && {
        text: profileData.email,
        url: `mailto:${profileData.email}`,
      },
      profileData.phone && {
        text: profileData.phone.toString(),
        url: `tel:${profileData.phone}`,
      },
      profileData.linkedin && { text: "LinkedIn", url: profileData.linkedin },
      profileData.codeChef?.username && {
        text: "CodeChef",
        url: profileData.codeChef.username,
      },
      profileData.leetCode?.username && {
        text: "LeetCode",
        url: profileData.leetCode.username,
      },
      profileData.github && { text: "GitHub", url: profileData.github },
    ].filter(Boolean);

    let contactX =
      (pageWidth -
        contactInfo.reduce(
          (acc, info) => acc + doc.getTextWidth(info.text) + 5,
          0
        )) /
      2;

    contactInfo.forEach((info, index) => {
      doc.setTextColor(index === 1 ? "black" : "blue");
      doc.textWithLink(info.text, contactX, y, { url: info.url });
      contactX += doc.getTextWidth(info.text) + 2;

      if (index < contactInfo.length - 1) {
        doc.text("|", contactX, y);
        contactX += doc.getTextWidth("|") + 2;
      }
    });

    doc.setTextColor("black");
    y += 2;
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // Sections
    addSection("About me", profileData.aboutMe);
    addSection(
      "Experience",
      profileData.experience?.map(
        (exp) =>
          `${exp.jobRole} at ${exp.companyName} (${exp.time}): ${exp.description}`
      ),
      false,
      true
    );
    addSection(
      "Projects",
      profileData.projects?.map(
        (project) => `${project.name}: ${project.description}`
      ),
      false,
      true
    );
    addSection(
      "Education",
      profileData.education?.map(
        (edu) =>
          `${edu.instituteName} (${edu.time}): ${
            edu.stream ? edu.stream + "\n" : ""
          }${edu.marks ? edu.marks : ""}`
      ),
      false,
      true
    );
    addSection("Skills", profileData.skills?.join(", "));
    addSection(
      "Certifications",
      profileData.certification?.map(
        (cert) => `${cert.instituteName} (${cert.time}): ${cert.desc}`
      ),
      false,
      true
    );
    addSection(
      "Subject of Interests",
      "Data Structures and Algorithms, Database and Management System"
    );
    addSection(
      "Extra-Curricular Activity",
      profileData.extracurricular?.join(", ")
    );

    // Watermark
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addWatermark();
    }

    doc.save(`${profileData.name}_cv.pdf`);
  };

  useEffect(() => {
    if (window.location.hash === "#/download-cv") {
      downloadPDF();
    }
  }, [profileData]);

  return (
    <div className="absolute bottom-4 right-4">
      <button
        onClick={downloadPDF}
        className="text-[#3fffff] hover:text-blue-300 px-5 py-3 rounded-lg text-sm font-medium flex items-center space-x-2-md hover:bg-white/10  transition-all duration-300 space-x-3"
      >
        <Download size={20} />
        <div>Download CV</div>
      </button>
    </div>
  );
}

export default CV;
