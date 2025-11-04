import React, { useState, useEffect } from 'react';

export const LeaderboardComponent = ({seriesData}:{seriesData: any}) => {
  return (
    <div>
      <h2>Leaderboard</h2>
      {/* Render leaderboard content here */}
      <p>{JSON.stringify(seriesData)}</p>
    </div>
  );
};

