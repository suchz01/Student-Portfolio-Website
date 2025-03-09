import React from "react";
import { User, Briefcase, Scroll, Ellipsis, Album } from "lucide-react";

function Second({ profileData }) {
  return (
    <div className="space-y-8 ">
      <div
        className="bg-[#29253b] backdrop-blur-lg rounded-md p-8 border border-white/20
        transition-all duration-500 
        hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
        hover:border-white/30 mt-8"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          < Album className="mr-3 text-[#3fffff]" size={24} />
          Education
        </h3>
        <ul className="space-y-4">
          {profileData.education.map((edu, index) => (
            <li
              key={index}
              className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <h4 className="text-xl font-medium text-white group-hover:text-[#DEDEE3] transition-colors">
                {edu.instituteName}
              </h4>
              <p className="text-l text-[#C5C5C9] mt-1">{edu.stream}</p>
              
              <p className="text-xs">{edu.time}</p>
              <p className='text-xl'>{edu.marks}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Projects Section */}
      <div
        className="bg-[#29253b] backdrop-blur-lg rounded-md p-8 border border-white/20
        transition-all duration-500 
        hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
        hover:border-white/30"
       
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          <Briefcase className="mr-3 text-[#3fffff]" size={24} />
          Projects
        </h3>
        <ul className="space-y-4">
          {profileData.projects.map((project, index) => (
            <li
              key={index}
              className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              onClick={() => window.open(project.link, '_blank')}
            >
              <h4 className="font-medium text-xl text-white group-hover:text-[#DEDEE3] transition-colors">
                {project.name}
              </h4>
              <p className="text-sm text-[#C5C5C9] mt-1">
                {project.description}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Experience Section */}
      <div
        className="bg-[#29253b] backdrop-blur-lg rounded-md p-8 border border-white/20
        transition-all duration-500 
        hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
        hover:border-white/30"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          <User className="mr-3 text-[#3fffff]" size={24} />
          Experience
        </h3>
        <ul className="space-y-4">
          {profileData.experience.map((job, index) => (
            <li
              key={index}
              className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <h4 className="text-2xl font-medium text-white group-hover:text-[#DEDEE3] transition-colors">
                {job.jobRole}
              </h4>
              <p className="text-xl text-[#C5C5C9] mt-1">{job.companyName}</p>
              <p className="text-sm">{job.time}</p>
              <p>{job.description}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Certificates Section */}
      <div
        className="bg-[#29253b] backdrop-blur-lg rounded-md p-8 border border-white/20
        transition-all duration-500 
        hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
        hover:border-white/30"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          <Scroll className="mr-3 text-[#3fffff]" size={24} />
          Certificates
        </h3>
        <ul className="space-y-4">
          {profileData.certification.map((certificate, index) => (
            <li
              key={index}
              className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <h4 className="font-semibold text-white group-hover:text-[#DEDEE3] transition-colors">
                {certificate.instituteName}
              </h4>
              <h1 className="font-normal">{certificate.time}</h1>

              <p className="text-sm text-[#C5C5C9] mt-1">{certificate.desc}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Extra Section */}
      <div
        className="bg-[#29253b] backdrop-blur-lg rounded-md p-8 border border-white/20
        transition-all duration-500 
        hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
        hover:border-white/30"
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          <Ellipsis className="mr-3 text-[#3fffff]" size={24} />
          Extra
        </h3>
        <ul className="space-y-4">
          {profileData.extracurricular.map((item, index) => (
            <li
              key={index}
              className="bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <h4 className="font-medium text-white group-hover:text-[#DEDEE3] transition-colors">
                {item}
              </h4>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Second;
