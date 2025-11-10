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

const PokerPlayersScoresChart = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    points: '',
    games: '',
    bounty: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Series state management
  const [series, setSeries] = useState<Series[]>([]);
  const [currentSeries, setCurrentSeries] = useState<Series | null>(null);
  const [showAddSeries, setShowAddSeries] = useState(false);
  const [showEditSeries, setShowEditSeries] = useState(false);
  const [seriesFormData, setSeriesFormData] = useState({ name: '', hasBounty: false, image: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    } else {
      // Create default series if none exist
      const defaultSeries = createDefaultSeries();
      setSeries([defaultSeries]);
      setCurrentSeries(defaultSeries);
    }

    // Check for legacy player data and migrate if needed
    const savedPlayers = localStorage.getItem('pokerPlayers');
    if (savedPlayers) {
      const playersData = JSON.parse(savedPlayers);
      
      // If we have legacy data and no series data yet, migrate to default series
      const existingSeriesData = localStorage.getItem('pokerSeries');
      if (!existingSeriesData && playersData.length > 0) {
        const defaultSeries = createDefaultSeries();
        localStorage.setItem(`pokerPlayers_${defaultSeries.id}`, JSON.stringify(playersData));
        localStorage.removeItem('pokerPlayers'); // Remove legacy data
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

  // Save series to localStorage whenever series state changes
  useEffect(() => {
    if (series.length > 0) {
      localStorage.setItem('pokerSeries', JSON.stringify(series));
    }
  }, [series]);

  // Save players to localStorage whenever players state changes
  useEffect(() => {
    if (currentSeries) {
      localStorage.setItem(`pokerPlayers_${currentSeries.id}`, JSON.stringify(players));
    }
  }, [players, currentSeries]);

  const calculatePPG = (points: number, games: number): number => {
    return games > 0 ? Math.round((points / games) * 100) / 100 : 0;
  };

  // Series management functions
  const createDefaultSeries = (): Series => ({
    id: 'default',
    name: 'Default Series',
    createdAt: new Date().toISOString(),
    hasBounty: false,
    image: undefined
  });

  const handleAddSeries = () => {
    if (seriesFormData.name.trim()) {
      const newSeries: Series = {
        id: Date.now().toString(),
        name: seriesFormData.name.trim(),
        createdAt: new Date().toISOString(),
        hasBounty: seriesFormData.hasBounty,
        image: seriesFormData.image.trim() || undefined
      };
      setSeries(prev => [...prev, newSeries]);
      setCurrentSeries(newSeries);
      setSeriesFormData({ name: '', hasBounty: false, image: '' });
      setImagePreview(null);
      setShowAddSeries(false);
    }
  };

  const handleEditSeries = () => {
    if (currentSeries && seriesFormData.name.trim()) {
      const updatedSeries = { 
        ...currentSeries, 
        name: seriesFormData.name.trim(), 
        hasBounty: seriesFormData.hasBounty,
        image: seriesFormData.image.trim() || undefined
      };
      setSeries(prev => prev.map(s => 
        s.id === currentSeries.id ? updatedSeries : s
      ));
      setCurrentSeries(updatedSeries);
      setSeriesFormData({ name: '', hasBounty: false, image: '' });
      setImagePreview(null);
      setShowEditSeries(false);
    }
  };

  const handleSeriesChange = (seriesId: string) => {
    const selectedSeries = series.find(s => s.id === seriesId);
    if (selectedSeries) {
      setCurrentSeries(selectedSeries);
    }
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
    const bounty = parseFloat(formData.bounty) || 0;
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
              ppg: calculatePPG(player.points + points, player.games + games),
              bounty: (player.bounty || 0) + bounty // Add to existing bounty
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
                ppg: calculatePPG(player.points + points, player.games + games),
                bounty: (player.bounty || 0) + bounty
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
          ppg,
          bounty: currentSeries?.hasBounty ? bounty : undefined
        };
        setPlayers(prev => [...prev, newPlayer]);
      }
    }

    // Reset form
    setFormData({ name: '', points: '', games: '', bounty: '' });
    setEditingId(null);
    
    // Show success message
    setSuccessMessage('Player added/updated.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEdit = (player: Player) => {
    setFormData({
      name: player.name,
      points: '',
      games: '',
      bounty: ''
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
    <div className="min-h-screen p-6 text-white bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="mb-8 text-4xl font-bold text-center text-blue-400">
          The Foundation
        </h1>

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

            {/* Add Series Button */}
            <button
              onClick={() => setShowAddSeries(true)}
              className="px-4 py-2 font-bold text-black transition-colors bg-green-600 rounded hover:bg-green-700"
            >
              Add Series
            </button>

            {/* Edit Series Button */}
            <button
              onClick={() => {
                setSeriesFormData({ 
                  name: currentSeries?.name || '', 
                  hasBounty: currentSeries?.hasBounty || false,
                  image: currentSeries?.image || ''
                });
                setImagePreview(currentSeries?.image || null);
                setShowEditSeries(true);
              }}
              disabled={!currentSeries}
              className="px-4 py-2 font-bold text-black transition-colors bg-yellow-600 rounded hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Edit Series
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="px-4 py-2 mb-6 text-center text-white bg-green-600 rounded">
            {successMessage}
          </div>
        )}

        {/* Add/Update Form */}
        <div className="p-6 mb-8 bg-gray-800 rounded-lg">
          <h2 className="mb-2 text-2xl font-bold text-yellow-400">
            Add Player / Update Stats
          </h2>
          {currentSeries && (
            <p className="mb-4 text-sm text-gray-400">
              Series: {currentSeries.name}
            </p>
          )}
          
          {!currentSeries ? (
            <p className="py-4 text-center text-gray-400">
              Please select or create a series to add players.
            </p>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium">
                Player
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="points" className="block mb-2 text-sm font-medium">
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
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="games" className="block mb-2 text-sm font-medium">
                Games <span className="text-gray-400">(will be added to existing)</span>
              </label>
              <input
                type="number"
                id="games"
                name="games"
                value={formData.games}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {currentSeries?.hasBounty && (
              <div>
                <label htmlFor="bounty" className="block mb-2 text-sm font-medium">
                  Bounty <span className="text-gray-400">(will be added to existing)</span>
                </label>
                <input
                  type="number"
                  id="bounty"
                  name="bounty"
                  value={formData.bounty}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="px-4 py-2 font-bold text-black transition-colors bg-yellow-600 rounded hover:bg-yellow-700"
            >
              Submit
            </button>
          </form>
          )}
        </div>

        {/* Current Standings */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="mb-2 text-2xl font-bold text-blue-400">
            Current Standings
          </h2>
          {currentSeries?.image && (
            <div className="flex justify-center mb-4">
              <img 
                src={currentSeries.image} 
                alt={`${currentSeries.name} series`} 
                className="object-contain border border-gray-600 rounded-lg max-w-48 max-h-48"
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
              No players added yet. Add your first player above!
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
                    <th className="px-2 py-3 font-bold text-yellow-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player, index) => (
                    <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-2 py-3">{index + 1}</td>
                      <td className="px-2 py-3 text-blue-400">{player.name}</td>
                      <td className="px-2 py-3">{player.points.toFixed(2)}</td>
                      <td className="px-2 py-3">{player.games}</td>
                      <td className="px-2 py-3">{player.ppg.toFixed(2)}</td>
                      {currentSeries?.hasBounty && (
                        <td className="px-2 py-3">{(player.bounty || 0).toFixed(2)}</td>
                      )}
                      <td className="px-2 py-3">
                        <button
                          onClick={() => handleEdit(player)}
                          className="px-3 py-1 mr-2 text-sm font-medium text-black bg-yellow-600 rounded hover:bg-yellow-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
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

        {/* Add Series Modal */}
        {showAddSeries && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg">
              <h3 className="mb-4 text-xl font-bold text-yellow-400">Add New Series</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-series-name" className="block mb-2 text-sm font-medium">
                    Series Name
                  </label>
                  <input
                    type="text"
                    id="new-series-name"
                    value={seriesFormData.name}
                    onChange={(e) => setSeriesFormData(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && seriesFormData.name.trim()) {
                        handleAddSeries();
                      } else if (e.key === 'Escape') {
                        setShowAddSeries(false);
                        setSeriesFormData({ name: '', hasBounty: false, image: '' });
                        setImagePreview(null);
                      }
                    }}
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter series name"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="new-series-image" className="block mb-2 text-sm font-medium">
                    Series Image <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="file"
                    id="new-series-image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          setSeriesFormData(prev => ({ ...prev, image: dataUrl }));
                          setImagePreview(dataUrl);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setSeriesFormData(prev => ({ ...prev, image: '' }));
                        setImagePreview(null);
                      }
                    }}
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Series preview" className="object-cover border border-gray-600 rounded-md max-w-32 max-h-32" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={seriesFormData.hasBounty}
                      onChange={(e) => setSeriesFormData(prev => ({ ...prev, hasBounty: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium">Include Bounty Column</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAddSeries(false);
                      setSeriesFormData({ name: '', hasBounty: false, image: '' });
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 text-gray-300 bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSeries}
                    disabled={!seriesFormData.name.trim()}
                    className="px-4 py-2 font-bold text-black bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Add Series
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Series Modal */}
        {showEditSeries && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg">
              <h3 className="mb-4 text-xl font-bold text-yellow-400">Edit Series</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-series-name" className="block mb-2 text-sm font-medium">
                    Series Name
                  </label>
                  <input
                    type="text"
                    id="edit-series-name"
                    value={seriesFormData.name}
                    onChange={(e) => setSeriesFormData(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && seriesFormData.name.trim()) {
                        handleEditSeries();
                      } else if (e.key === 'Escape') {
                        setShowEditSeries(false);
                        setSeriesFormData({ name: '', hasBounty: false, image: '' });
                        setImagePreview(null);
                      }
                    }}
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter series name"
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="edit-series-image" className="block mb-2 text-sm font-medium">
                    Series Image <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="file"
                    id="edit-series-image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          setSeriesFormData(prev => ({ ...prev, image: dataUrl }));
                          setImagePreview(dataUrl);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setSeriesFormData(prev => ({ ...prev, image: '' }));
                        setImagePreview(null);
                      }
                    }}
                    className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Series preview" className="object-cover border border-gray-600 rounded-md max-w-32 max-h-32" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={seriesFormData.hasBounty}
                      onChange={(e) => setSeriesFormData(prev => ({ ...prev, hasBounty: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium">Include Bounty Column</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEditSeries(false);
                      setSeriesFormData({ name: '', hasBounty: false, image: '' });
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 text-gray-300 bg-gray-600 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSeries}
                    disabled={!seriesFormData.name.trim()}
                    className="px-4 py-2 font-bold text-black bg-yellow-600 rounded hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokerPlayersScoresChart;