import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGlobalLeaderboard, getWeeklyLeaderboard } from '../../services/leaderboardService';
import Button from '../../components/common/Button';

const LeaderboardPage = () => {
    const [activeTab, setActiveTab] = useState('global');
    const [globalData, setGlobalData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const loadLeaderboard = async (tab) => {
        setLoading(true);
        try {
            if (tab === 'global') {
                const data = await getGlobalLeaderboard();
                setGlobalData(data.data || []);
            } else {
                const data = await getWeeklyLeaderboard();
                setWeeklyData(data.data || []);
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaderboard(activeTab);
    }, [activeTab]);

    const data = activeTab === 'global' ? globalData : weeklyData;
    const title = activeTab === 'global' ? 'Global Rankings' : `Weekly Rankings (Week ${weeklyData[0]?.weekNumber || ''})`;

return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-black to-gray-950 relative z-10 max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
className="text-3xl font-bold text-dark-100 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent drop-shadow-lg"
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setActiveTab('global')}
className={activeTab === 'global' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25' : 'bg-dark-700 hover:bg-dark-600 border border-dark-600 text-dark-200 hover:text-dark-100 shadow-md hover:shadow-lg shadow-emerald-500/20'}
                    >
                        Global
                    </Button>
                    <Button 
                        onClick={() => setActiveTab('weekly')}
                        className={activeTab === 'weekly' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 hover:bg-gray-300'}
                    >
                        Weekly
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.map((entry, index) => (
                                    <tr key={entry._id || index} className={user?._id === entry.userId?._id ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            #{entry.rank}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {entry.userId?.profileImage && (
                                                    <img 
                                                        className="h-10 w-10 rounded-full object-cover mr-4"
                                                        src={entry.userId.profileImage} 
                                                        alt={entry.username}
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                                                    {entry.username}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                                            {entry.score?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                            No rankings yet. Be the first to play!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderboardPage;

