import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";

const CV = ({ profileData, variant = "outline", size = "sm", className = "w-full flex items-center gap-2" }) => {
  const handleDownloadCV = () => {
    if (!profileData) {
      toast.error("Profile data not available");
      return;
    }

    // Create a new jsPDF instance
    const doc = new jsPDF({ format: "a4" });
    const pageWidth = 210; // A4 page width in mm
    const margin = 10;
    const textWidth = pageWidth - 2 * margin;
    let y = margin + 5;
    const lineHeight = 5;
    const maxY = 297 - margin;

    const addSection = (title, content, isIndented = false, isProjectOrExperience = false) => {
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
            const splitDescription = doc.splitTextToSize(description, textWidth - 5);
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
      doc.text("Made from horizon", pageWidth - margin, 297 - 5, { align: "right" });
      doc.setTextColor(0);
    };

    // Add Header with gradient background
    doc.setFillColor(63, 81, 181); // Indigo color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(24);
    doc.text(profileData.name || "Resume", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(profileData.subject || "Software Developer", pageWidth / 2, 30, { align: "center" });
    
    y = 50; // Start content after header
    doc.setTextColor(0, 0, 0); // Reset to black text

    // Contact Info
    doc.setFontSize(12);
    const contactInfo = [
      profileData.email && { text: profileData.email, url: `mailto:${profileData.email}` },
      profileData.phone && { text: profileData.phone.toString(), url: `tel:${profileData.phone}` },
      profileData.linkedin && { text: "LinkedIn", url: profileData.linkedin },
      profileData.github?.username && { text: "GitHub", url: `https://github.com/${profileData.github.username}` }
    ].filter(Boolean);

    let contactX = (pageWidth - contactInfo.reduce((acc, info) => acc + doc.getTextWidth(info.text) + 5, 0)) / 2;

    contactInfo.forEach((info, index) => {
      doc.setTextColor(0, 0, 255); // Blue for links
      doc.textWithLink(info.text, contactX, y, { url: info.url });
      contactX += doc.getTextWidth(info.text) + 2;

      if (index < contactInfo.length - 1) {
        doc.setTextColor(0); // Black for separator
        doc.text("|", contactX, y);
        contactX += doc.getTextWidth("|") + 2;
      }
    });

    doc.setTextColor(0); // Reset to black
    y += 5;

    // Add About Me section
    addSection("About Me", profileData.aboutMe);

    // Add Experience section
    addSection(
      "Experience",
      profileData.experience?.map(
        (exp) => `${exp.jobRole} at ${exp.companyName} (${exp.startDate} - ${exp.endDate || 'Present'}): ${exp.description || ''}`
      ),
      false,
      true
    );

    // Add Projects section
    addSection(
      "Projects",
      profileData.projects?.map(
        (project) => `${project.name}: ${project.description || ''}`
      ),
      false,
      true
    );

    // Add Education section
    addSection(
      "Education",
      profileData.education?.map(
        (edu) => `${edu.instituteName} (${edu.startDate} - ${edu.endDate || 'Present'}): ${edu.stream || ''}`
      ),
      false,
      true
    );

    // Combine regular and tested skills
    const allSkills = [
      ...(profileData.skills || []),
      ...(profileData.testedSkills?.map(ts => `${ts.skill} (${ts.score}%)`) || [])
    ];
    
    // Add Skills section
    addSection("Skills", allSkills.join(", "));

    // Add Certifications section
    addSection(
      "Certifications",
      profileData.certification?.map(
        (cert) => `${cert.certificateName} from ${cert.instituteName}: ${cert.desc || ''}`
      ),
      false,
      true
    );

    // Add Extra-Curricular Activity section
    if (profileData.extracurricular?.length > 0) {
      addSection("Extra-Curricular Activities", profileData.extracurricular.join(", "));
    }

    // Add watermark on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addWatermark();
    }

    // Save the PDF
    doc.save(`${profileData.name || 'profile'}_resume.pdf`);
    toast.success('CV downloaded successfully!');
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownloadCV}
    >
      <Download size={16} />
      Download CV
    </Button>
  );
};

export default CV;
