import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOdds } from '../../hooks/useOdds';
import { Trophy, Calendar, Filter, Settings, RefreshCw } from 'lucide-react';
import { oddsApi } from '../../services/odds';

const FOOTBALL_LEAGUES = [
  { key: 'soccer_uefa_champs_league', name: 'Champions League' },
  { key: 'soccer_epl', name: 'Premier League' },
  { key: 'soccer_spain_la_liga', name: 'La Liga' },
  { key: 'soccer_france_ligue_one', name: 'Ligue 1' }
].filter(league => {
  const config = oddsApi.getSportConfig(league.key);
  return config.enabled;
});

export default function FootballMatches() {
  const [selectedLeague, setSelectedLeague] = useState(FOOTBALL_LEAGUES[0]?.key || '');
  const { data: matches, isLoading, error, refetch } = useOdds(selectedLeague);

  const handleRefresh = () => {
    refetch();
  };

  // Si l'API n'est pas configurée
  if (!oddsApi.isConfigured()) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="max-w-md mx-auto">
          <Settings className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Service en maintenance</h3>
          <p className="text-gray-600 mb-4">
            Les cotes sont temporairement indisponibles. Nous travaillons à rétablir le service au plus vite.
          </p>
        </div>
      </div>
    );
  }

  // Si aucun championnat n'est activé
  if (FOOTBALL_LEAGUES.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="max-w-md mx-auto">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Mise à jour des championnats</h3>
          <p className="text-gray-600 mb-4">
            Les championnats sont en cours de mise à jour. Les nouveaux matchs seront bientôt disponibles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Matchs à venir</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* League Selector */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {FOOTBALL_LEAGUES.map((league) => (
            <button
              key={league.key}
              onClick={() => setSelectedLeague(league.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedLeague === league.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="max-w-md mx-auto">
            <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Données indisponibles</h3>
            <p className="text-gray-600 mb-4">
              Impossible de récupérer les matchs pour le moment.
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : matches?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Aucun match disponible pour le moment</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches?.slice(0, 6).map((match) => {
              const mainMarket = match.bookmakers[0]?.markets[0];
              const homeOdds = mainMarket?.outcomes.find(o => o.name === match.home_team)?.price;
              const awayOdds = mainMarket?.outcomes.find(o => o.name === match.away_team)?.price;
              const drawOdds = mainMarket?.outcomes.find(o => o.name === 'Draw')?.price;

              return (
                <div key={match.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-blue-600">{match.sport_title}</span>
                    <span className="flex items-center gap-1 text-gray-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(match.commence_time).toLocaleString('fr-FR', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 text-center">
                      <h3 className="font-semibold">{match.home_team}</h3>
                    </div>
                    <div className="px-2 text-gray-500">VS</div>
                    <div className="flex-1 text-center">
                      <h3 className="font-semibold">{match.away_team}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {homeOdds && (
                      <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <div className="text-sm text-gray-600">1</div>
                        <div className="text-lg font-bold text-blue-600">{homeOdds.toFixed(2)}</div>
                      </button>
                    )}
                    {drawOdds && (
                      <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <div className="text-sm text-gray-600">X</div>
                        <div className="text-lg font-bold text-blue-600">{drawOdds.toFixed(2)}</div>
                      </button>
                    )}
                    {awayOdds && (
                      <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <div className="text-sm text-gray-600">2</div>
                        <div className="text-lg font-bold text-blue-600">{awayOdds.toFixed(2)}</div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to="/football"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir tous les matchs
            </Link>
          </div>
        </>
      )}
    </div>
  );
}