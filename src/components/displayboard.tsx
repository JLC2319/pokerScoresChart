import React, { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  points: number;
  games: number;
  ppg: number;
  bounty?: number;
}

interface Series {
  id: string;
  name: string;
  createdAt: string;
  hasBounty: boolean;
  image?: string;
}

export const LeaderboardComponent = ({ seriesData }: { seriesData: any }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [currentSeries, setCurrentSeries] = useState<Series | null>(null);

  // Load series and players from localStorage on component mount
  useEffect(() => {
    // Load series
    const savedSeries = localStorage.getItem('pokerSeries');
    if (savedSeries) {
      const seriesData = JSON.parse(savedSeries);
      setSeries(seriesData);
      
      // Set the first series as current if available
      if (seriesData.length > 0) {
        setCurrentSeries(seriesData[0]);
      }
    }
  }, []);

  // Load players for current series whenever currentSeries changes
  useEffect(() => {
    if (currentSeries) {
      const savedPlayers = localStorage.getItem(`pokerPlayers_${currentSeries.id}`);
      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      } else {
        setPlayers([]);
      }
    }
  }, [currentSeries]);

  const handleSeriesChange = (seriesId: string) => {
    const selectedSeries = series.find(s => s.id === seriesId);
    if (selectedSeries) {
      setCurrentSeries(selectedSeries);
    }
  };

  // Sort players by points (descending), then by PPG (descending)
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.ppg - a.ppg;
  });

  return (
    <div className="min-h-screen p-6 text-white bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-blue-400">
            The Foundation - Leaderboard
          </h1>
          <a
            href="/"
            className="px-4 py-2 font-bold text-black transition-colors bg-gray-600 rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </a>
        </div>

        {/* Series Selector */}
        <div className="p-6 mb-8 bg-gray-800 rounded-lg">
          <h2 className="mb-4 text-xl font-bold text-yellow-400">
            Series
          </h2>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Series Dropdown */}
            <div className="flex-1 min-w-48">
              <label htmlFor="series-select" className="sr-only">Select Series</label>
              <select
                id="series-select"
                value={currentSeries?.id || ''}
                onChange={(e) => handleSeriesChange(e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {series.length === 0 && (
                  <option value="">No series available</option>
                )}
                {series.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="mb-2 text-2xl font-bold text-blue-400">
            Current Standings
          </h2>
          {currentSeries?.image && (
            <div className="flex justify-center mb-4">
              <img 
                src={currentSeries.image} 
                alt={`${currentSeries.name} series`} 
                className="object-cover w-full border border-gray-600 rounded-lg max-h-48"
              />
            </div>
          )}
          {currentSeries && (
            <p className="mb-4 text-sm text-gray-400">
              Series: {currentSeries.name}
            </p>
          )}

          {players.length === 0 ? (
            <p className="py-8 text-center text-gray-400">
              No players in this series yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-2 py-3 font-bold text-yellow-400">Rank</th>
                    <th className="px-2 py-3 font-bold text-yellow-400">Player</th>
                    <th className="px-2 py-3 font-bold text-yellow-400">Points</th>
                    <th className="px-2 py-3 font-bold text-yellow-400">Games</th>
                    <th className="px-2 py-3 font-bold text-yellow-400">PPG</th>
                    {currentSeries?.hasBounty && (
                      <th className="px-2 py-3 font-bold text-yellow-400">Bounty</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => (
                    <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-2 py-3 font-semibold">
                        {index === 0 && (
                          <span className="text-yellow-400">🥇</span>
                        )}
                        {index === 1 && (
                          <span className="text-gray-300">🥈</span>
                        )}
                        {index === 2 && (
                          <span className="text-amber-600">🥉</span>
                        )}
                        {index < 3 ? ` ${index + 1}` : index + 1}
                      </td>
                      <td className="px-2 py-3 font-semibold text-blue-400">{player.name}</td>
                      <td className="px-2 py-3 font-medium">{player.points.toFixed(2)}</td>
                      <td className="px-2 py-3">{player.games}</td>
                      <td className="px-2 py-3">{player.ppg.toFixed(2)}</td>
                      {currentSeries?.hasBounty && (
                        <td className="px-2 py-3">{(player.bounty || 0).toFixed(2)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        {players.length > 0 && (
          <div className="p-6 mt-8 bg-gray-800 rounded-lg">
            <h3 className="mb-4 text-xl font-bold text-yellow-400">Series Statistics</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{players.length}</p>
                <p className="text-sm text-gray-400">Total Players</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {players.reduce((sum, player) => sum + player.games, 0)}
                </p>
                <p className="text-sm text-gray-400">Total Games</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {players.reduce((sum, player) => sum + player.points, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">Total Points</p>
              </div>
              {currentSeries?.hasBounty && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {players.reduce((sum, player) => sum + (player.bounty || 0), 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">Total Bounties</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

