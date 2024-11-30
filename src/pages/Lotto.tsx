import React, { useEffect, useState } from 'react';
import { Calendar, Clock, DollarSign, Ticket, AlertCircle } from 'lucide-react';
import { LottoService, LottoEvent } from '../services/lotto';
import { useAuth } from '../contexts/AuthContext';
import LoadingState from '../components/LoadingState';
import ParticipationModal from '../components/lotto/ParticipationModal';
import AuthMobileModal from '../components/auth/AuthMobileModal';
import AuthDesktopModal from '../components/auth/AuthDesktopModal';
import { getStatusLabel, handleParticipationClick } from '../utils/lottoUtils';

export default function Lotto() {
  const { currentUser } = useAuth();
  const [lottos, setLottos] = useState<LottoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLotto, setSelectedLotto] = useState<LottoEvent | null>(null);
  const [participationError, setParticipationError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('en_cours');

  useEffect(() => {
    fetchLottos();
  }, []);

  const fetchLottos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LottoService.getAllLottos();
      setLottos(data);
    } catch (err) {
      setError('Erreur lors du chargement des lottos');
      console.error('Error fetching lottos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async (selectedNumbers: number[]) => {
    if (!currentUser || !selectedLotto) {
      setShowAuthModal(true);
      return;
    }

    try {
      await LottoService.participate({
        lottoId: selectedLotto.id!,
        userId: currentUser.uid,
        selectedNumbers,
        ticketPrice: selectedLotto.ticketPrice,
        currency: selectedLotto.currency
      });
      
      setSelectedLotto(null);
      setParticipationError(null);
    } catch (err) {
      setParticipationError(err instanceof Error ? err.message : 'Erreur lors de la participation');
    }
  };

  const handleLottoClick = (lotto: LottoEvent) => {
    try {
      if (!currentUser) {
        setShowAuthModal(true);
        return;
      }

      if (handleParticipationClick(lotto)) {
        setSelectedLotto(lotto);
        setParticipationError(null);
      }
    } catch (err) {
      setParticipationError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredLottos = lottos.filter(lotto => {
    const matchesDate = !dateFilter || lotto.startDate.startsWith(dateFilter);
    const status = getStatusLabel(lotto).label.toLowerCase().replace(' ', '_');
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesDate && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <LoadingState message="Chargement des lottos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lotto</h1>
          {participationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600">{participationError}</p>
            </div>
          )}
        </div>

        {/* Filtres */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en_cours">En cours</option>
              <option value="en_attente">En attente</option>
              <option value="termine">Terminé</option>
              <option value="all">Tous les statuts</option>
            </select>
          </div>
        </div>

        {lottos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Aucun lotto disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLottos.map((lotto) => {
              const status = getStatusLabel(lotto);
              const StatusIcon = status.icon;
              
              return (
                <div key={lotto.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">{lotto.eventName}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.className} flex items-center gap-1`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Début: {formatDate(lotto.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Fin: {formatDate(lotto.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Prix: {formatCurrency(lotto.ticketPrice, lotto.currency)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {lotto.gridsPerTicket} grille{lotto.gridsPerTicket > 1 ? 's' : ''} par ticket
                      </div>
                    </div>

                    <button 
                      onClick={() => handleLottoClick(lotto)}
                      className={`mt-6 w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2
                        ${status.label === 'En cours'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <Ticket className="w-5 h-5" />
                      {status.label === 'En cours' ? 'Jouer' : 'Voir les détails'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedLotto && (
          <ParticipationModal
            lotto={selectedLotto}
            onClose={() => setSelectedLotto(null)}
            onSubmit={handleParticipate}
          />
        )}

        {/* Auth Modals */}
        <AuthMobileModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          message="Connectez-vous pour participer au tirage"
        />
        <AuthDesktopModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          message="Connectez-vous pour participer au tirage"
        />
      </div>
    </div>
  );
}