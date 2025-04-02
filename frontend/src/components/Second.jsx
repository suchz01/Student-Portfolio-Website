import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Briefcase, Award, FileCode, Coffee, CalendarDays, 
  Building, ExternalLink, Clock, Bookmark, Medal, Plus, MapPin
} from 'lucide-react';
function Second({ profileData }) {
 
  // Ensure profileData is never undefined when accessed
  const safeProfileData = profileData || {};
  const navigate = useNavigate();
  
  // Check if any section has data to display
  const hasEducation = safeProfileData.education && safeProfileData.education.length > 0;
  const hasProjects = safeProfileData.projects && safeProfileData.projects.length > 0;
  const hasExperience = safeProfileData.experience && safeProfileData.experience.length > 0;
  const hasCertificates = safeProfileData.certification && safeProfileData.certification.length > 0;
  const hasExtracurricular = safeProfileData.extracurricular && safeProfileData.extracurricular.length > 0;
  
  // Check if we need to display an empty state
  const isEmpty = !hasEducation && !hasProjects && !hasExperience && !hasCertificates && !hasExtracurricular;

  // Format a single date for display
  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (e) {
      return '';
    }
  };

  // Format a date range for display
  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '';
    
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    
    return start && end ? `${start} - ${end}` : '';
  };

  // Debug function to check data structure in console
  React.useEffect(() => {
    if (safeProfileData?.experience?.length > 0) {
      console.log('Experience data:', safeProfileData.experience);
    }
    if (safeProfileData?.extracurricular?.length > 0) {
      console.log('Extracurricular data:', safeProfileData.extracurricular);
    }
  }, [safeProfileData]);

  return (
    <div className="space-y-8">
      {/* Education Section */}
      {hasEducation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-indigo-500" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Education</h2>
            </div>
            <span className="text-xs text-muted-foreground">{safeProfileData.education?.length || 0} entries</span>
          </div>
          
          <div className="space-y-4">
            {safeProfileData.education?.map((edu, index) => (
              <div 
                key={index}
                className="bg-background/50 rounded-xl p-4 border border-border hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground">{edu.instituteName || edu.institute || 'Institution Name Not Available'}</h3>
                    <p className="text-sm text-foreground/70">{edu.stream || edu.degree || edu.program || 'Degree/Program Not Available'}</p>
                    
                    {/* Time period or date range */}
                    <div className="flex items-center mt-1.5 text-xs text-foreground/60">
                      <CalendarDays size={12} className="mr-1" />
                      <span>
                        {edu.time || formatDateRange(edu.startDate, edu.endDate) || 'Timeline not specified'}
                      </span>
                      {edu.isCurrent && (
                        <span className="ml-2 bg-green-500/10 px-1.5 py-0.5 rounded text-green-500 text-xs">Current</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Marks/Score */}
                  {edu.marks && (
                    <div className="bg-indigo-500/10 px-2 py-1 rounded-md text-xs text-indigo-500">
                      {edu.marks}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {hasProjects && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <FileCode className="text-indigo-500" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            </div>
            <span className="text-xs text-muted-foreground">{safeProfileData.projects?.length || 0} entries</span>
          </div>
          
          <div className="space-y-4">
            {safeProfileData.projects?.map((project, index) => (
              <div 
                key={index}
                className="bg-background/50 rounded-xl p-4 border border-border hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-foreground">{project.name || project.title || 'Untitled Project'}</h3>
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-400"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                
                {/* Date range for project */}
                {(project.startDate || project.endDate) && (
                  <div className="flex items-center mt-1 text-xs text-foreground/60">
                    <CalendarDays size={12} className="mr-1" />
                    <span>{formatDateRange(project.startDate, project.endDate)}</span>
                    {project.isActive && (
                      <span className="ml-2 bg-green-500/10 px-1.5 py-0.5 rounded text-green-500 text-xs">Active</span>
                    )}
                  </div>
                )}
                
                {project.description && (
                  <p className="text-sm text-foreground/70 mt-2">{project.description}</p>
                )}
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.technologies.map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="bg-indigo-500/10 px-2 py-0.5 rounded-full text-xs text-indigo-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience Section */}
      {hasExperience && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="text-indigo-500" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Experience</h2>
            </div>
            <span className="text-xs text-muted-foreground">{safeProfileData.experience?.length || 0} entries</span>
          </div>
          
          <div className="space-y-4">
            {safeProfileData.experience?.map((exp, index) => (
              <div 
                key={index}
                className="bg-background/50 rounded-xl p-4 border border-border hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {exp.jobRole || exp.role || exp.position || exp.name || 'Job Role Not Available'}
                    </h3>
                    <div className="flex items-center text-sm text-foreground/70">
                      <Building size={12} className="mr-1" />
                      <span>{exp.companyName || exp.company || exp.organization || 'Company Name Not Available'}</span>
                    </div>
                    
                    {/* Location if available */}
                    {exp.location && (
                      <div className="flex items-center text-xs text-foreground/60 mt-1">
                        <MapPin size={12} className="mr-1" />
                        <span>{exp.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-indigo-500/10 px-2 py-1 rounded-md text-xs text-indigo-500">
                    {exp.time || formatDateRange(exp.startDate, exp.endDate) || 'Timeline not specified'}
                  </div>
                </div>
                
                {/* Skills used at this position */}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {exp.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex}
                        className="bg-indigo-500/5 px-1.5 py-0.5 rounded text-xs text-indigo-500/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                {exp.description || exp.desc ? (
                  <p className="text-sm text-foreground/70 mt-2">{exp.description || exp.desc}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates Section */}
      {hasCertificates && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Award className="text-indigo-500" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Certificates</h2>
            </div>
            <span className="text-xs text-muted-foreground">{safeProfileData.certification?.length || 0} entries</span>
          </div>
          
          <div className="space-y-4">
            {safeProfileData.certification?.map((cert, index) => (
              <div 
                key={index}
                className="bg-background/50 rounded-xl p-4 border border-border hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {cert.certificateName || cert.title || cert.name || 'Certificate Name Not Available'}
                    </h3>
                    <p className="text-sm text-foreground/70">
                      {cert.instituteName || cert.issuer || cert.issuedBy || cert.organization || 'Issuing Institution Not Available'}
                    </p>
                    
                    {/* Date information */}
                    <div className="flex items-center mt-1.5 text-xs text-foreground/60">
                      <CalendarDays size={12} className="mr-1" />
                      <span>
                        {cert.time || formatDate(cert.issueDate) || 'Date not specified'}
                      </span>
                      {(cert.expiryDate || cert.credentialId) && (
                        <span className="ml-2 border-l border-border/50 pl-2">
                          {cert.expiryDate ? `Expires: ${formatDate(cert.expiryDate)}` : ''}
                          {cert.credentialId ? (cert.expiryDate ? ' • ' : '') + `ID: ${cert.credentialId}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* View Certificate Link */}
                  {(cert.credentialURL || cert.link) && (
                    <a 
                      href={cert.credentialURL || cert.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-400"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                
                {/* Skills for this certification */}
                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cert.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex}
                        className="bg-indigo-500/5 px-1.5 py-0.5 rounded text-xs text-indigo-500/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Description if available */}
                {cert.desc || cert.description ? (
                  <p className="text-sm text-foreground/70 mt-2 border-t border-border/50 pt-2">
                    {cert.desc || cert.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracurricular Section */}
      {hasExtracurricular && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Coffee className="text-indigo-500" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Extracurricular</h2>
            </div>
            <span className="text-xs text-muted-foreground">{safeProfileData.extracurricular?.length || 0} entries</span>
          </div>
          
          <div className="space-y-4">
            {/* Handle extracurricular as an array of strings, not objects */}
            {Array.isArray(safeProfileData.extracurricular) && safeProfileData.extracurricular.map((activity, index) => (
              <div 
                key={index}
                className="bg-background/50 rounded-xl p-4 border border-border hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground">{typeof activity === 'string' ? activity : (activity.title || 'Untitled Activity')}</h3>
                  </div>
                  {typeof activity !== 'string' && activity.time && (
                    <div className="bg-indigo-500/10 px-2 py-1 rounded-md text-xs text-indigo-500">
                      {activity.time}
                    </div>
                  )}
                </div>
                {typeof activity !== 'string' && activity.description && (
                  <p className="text-sm text-foreground/70 mt-2">{activity.description}</p>
                )}
                {typeof activity !== 'string' && activity.achievements && activity.achievements.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-xs font-medium text-foreground/70 flex items-center">
                      <Medal size={12} className="mr-1 text-yellow-500" />
                      Achievements
                    </h4>
                    <ul className="list-disc list-inside text-xs text-foreground/70 mt-1">
                      {activity.achievements.map((achievement, achIndex) => (
                        <li key={achIndex}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State - Show this if there's no data to display */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 cursor-pointer">
            <Plus className="text-indigo-500 hover:scale-110" size={24} onClick={() => navigate("/edit")}/>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Profile Information</h3>
          <p className="text-foreground/70 mb-4 max-w-md mx-auto">
            Your profile sections are currently empty. Complete your profile to showcase your education, projects, experience, and more.
          </p>
        </div>
      )}
    </div>
  );
}

export default Second;
