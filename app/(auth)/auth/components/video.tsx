import React from 'react';

const Video = () => {
  return (
    <div hidden className="fixed inset-0 w-6/12 lg:block">
      <span className="absolute bottom-6 left-6 z-10 text-sm text-white bg-primary p-4 rounded-full shadow-md">
        © {new Date().getFullYear()} Created by
        <a
          href="https://www.theconceptdesk.co.za/"
          target="blank"
          title="Development company url"
          className="cursor-pointer"
        >
          {' '}
          The Concept Desk
        </a>
      </span>
      <video
        className="left-12 h-full w-full object-cover"
        muted
        poster="images/back.png"
      ></video>
    </div>
  );
};

export default Video;
