import React, { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  points: number;
  games: number;
  ppg: number;
}

const PokerPlayerScoresChart = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    points: '',
    games: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load players from localStorage on component mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('pokerPlayers');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
  }, []);

  // Save players to localStorage whenever players state changes
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('pokerPlayers', JSON.stringify(players));
    }
  }, [players]);

  const calculatePPG = (points: number, games: number): number => {
    return games > 0 ? Math.round((points / games) * 100) / 100 : 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const points = parseFloat(formData.points) || 0;
    const games = parseInt(formData.games) || 0;
    const ppg = calculatePPG(points, games);

    if (editingId) {
      // Update existing player
      setPlayers(prev => prev.map(player => 
        player.id === editingId 
          ? {
              ...player,
              name: formData.name,
              points: player.points + points, // Add to existing points
              games: player.games + games,   // Add to existing games
              ppg: calculatePPG(player.points + points, player.games + games)
            }
          : player
      ));
    } else {
      // Add new player
      const existingPlayer = players.find(p => p.name.toLowerCase() === formData.name.toLowerCase());
      
      if (existingPlayer) {
        // Update existing player's stats
        setPlayers(prev => prev.map(player => 
          player.name.toLowerCase() === formData.name.toLowerCase()
            ? {
                ...player,
                points: player.points + points,
                games: player.games + games,
                ppg: calculatePPG(player.points + points, player.games + games)
              }
            : player
        ));
      } else {
        // Create new player
        const newPlayer: Player = {
          id: Date.now().toString(),
          name: formData.name,
          points,
          games,
          ppg
        };
        setPlayers(prev => [...prev, newPlayer]);
      }
    }

    // Reset form
    setFormData({ name: '', points: '', games: '' });
    setEditingId(null);
    
    // Show success message
    setSuccessMessage('Player added/updated.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = (player: Player) => {
    setFormData({
      name: player.name,
      points: '',
      games: ''
    });
    setEditingId(player.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      setPlayers(prev => prev.filter(player => player.id !== id));
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-blue-400 mb-8">
          The Syndicate-Dominion SERIES Admin Dashboard
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-600 text-white px-4 py-2 rounded mb-6 text-center">
            {successMessage}
          </div>
        )}

        {/* Add/Update Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">
            Add Player / Update Stats
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Player
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="points" className="block text-sm font-medium mb-2">
                Points <span className="text-gray-400">(will be added to existing)</span>
              </label>
              <input
                type="number"
                id="points"
                name="points"
                value={formData.points}
                onChange={handleInputChange}
                step="0.01"
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="games" className="block text-sm font-medium mb-2">
                Games <span className="text-gray-400">(will be added to existing)</span>
              </label>
              <input
                type="number"
                id="games"
                name="games"
                value={formData.games}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded transition-colors"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Current Standings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">
            Current Standings
          </h2>

          {players.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No players added yet. Add your first player above!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-yellow-400 font-bold py-3 px-2">Rank</th>
                    <th className="text-yellow-400 font-bold py-3 px-2">Player</th>
                    <th className="text-yellow-400 font-bold py-3 px-2">Points</th>
                    <th className="text-yellow-400 font-bold py-3 px-2">Games</th>
                    <th className="text-yellow-400 font-bold py-3 px-2">PPG</th>
                    <th className="text-yellow-400 font-bold py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => (
                    <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-2">{index + 1}</td>
                      <td className="py-3 px-2 text-blue-400">{player.name}</td>
                      <td className="py-3 px-2">{player.points.toFixed(2)}</td>
                      <td className="py-3 px-2">{player.games}</td>
                      <td className="py-3 px-2">{player.ppg.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleEdit(player)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 rounded mr-2 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokerPlayerScoresChart;