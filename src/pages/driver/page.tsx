import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import MenuDrawer from './components/MenuDrawer';
import RouteScreen from './components/RouteScreen';
import DetailScreen from './components/DetailScreen';
import StartVisitScreen from './components/StartVisitScreen';
import DelayedScreen from './components/DelayedScreen';
import CollectScreen from './components/CollectScreen';
import PhotosScreen from './components/PhotosScreen';
import SummaryScreen from './components/SummaryScreen';
import ReceiptScreen from './components/ReceiptScreen';
import EndDayScreen from './components/EndDayScreen';
import HistoryScreen from './components/HistoryScreen';
import ProfileScreen from './components/ProfileScreen';
import type { DriverScreen, ActiveVisitState } from './types';
import type { RouteVisit } from '@/mocks/driverApp';
import { driverAppData } from '@/mocks/driverApp';

const OIL_PRICE = 800;

export default function DriverPage() {
  const [screen, setScreen] = useState<DriverScreen>('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [routeStarted, setRouteStarted] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<RouteVisit | null>(null);
  const [activeVisit, setActiveVisit] = useState<ActiveVisitState | null>(null);

  const handleLogin = () => {
    setScreen('home');
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setScreen('login');
    setMenuOpen(false);
    setRouteStarted(false);
    setSelectedVisit(null);
    setActiveVisit(null);
  };

  const handleNavigate = (s: DriverScreen) => {
    setScreen(s);
  };

  const handleStartRoute = () => {
    setRouteStarted(true);
    setScreen('route');
  };

  const handleSelectVisit = (visit: RouteVisit) => {
    setSelectedVisit(visit);
    setScreen('detail');
  };

  const handleStartVisit = () => {
    if (!selectedVisit) return;
    setActiveVisit({
      visitId: selectedVisit.id,
      status: 'Open',
      liters: '',
      receiverName: '',
      receiverDni: '',
      oilPaid: false,
      oilAmount: '',
      oilPriceAtCollection: OIL_PRICE,
      totalOilPayment: 0,
      products: '',
      observations: '',
      photos: [],
      arrivedAt: '',
      gpsLat: selectedVisit.lat,
      gpsLng: selectedVisit.lng,
      delayReason: '',
      delayReturnTime: '',
      detergentDelivered: false,
      detergentQuantity: '',
      totalDetergentPayment: 0,
    });
    setScreen('startVisit');
  };

  const handleStartVisitContinue = (status: ActiveVisitState['status'], arrivedAt: string) => {
    setActiveVisit((prev) => (prev ? { ...prev, status, arrivedAt } : null));
    if (status === 'Delayed') {
      setScreen('delayed');
    } else {
      setScreen('collect');
    }
  };

  const handleDelayedContinue = (delayReason: string, delayReturnTime: string) => {
    setActiveVisit((prev) => (prev ? { ...prev, delayReason, delayReturnTime } : null));
    if (activeVisit) {
      const visit = driverAppData.todayVisits.find((v) => v.id === activeVisit.visitId);
      if (visit) {
        visit.status = 'Delayed';
        visit.observations = delayReason;
      }
    }
    setActiveVisit(null);
    setSelectedVisit(null);
    setScreen('route');
  };

  const handleCollectContinue = (data: Partial<ActiveVisitState>) => {
    setActiveVisit((prev) => {
      if (!prev) return null;
      const liters = Number(data.liters || prev.liters || 0);
      const oilPaid = data.oilPaid !== undefined ? data.oilPaid : prev.oilPaid;
      const oilAmount = Number(data.oilAmount || prev.oilAmount || 0);
      const oilAuto = liters * prev.oilPriceAtCollection;
      const totalOilPayment = oilPaid ? (oilAmount > 0 ? oilAmount : oilAuto) : 0;

      return {
        ...prev,
        ...data,
        totalOilPayment,
      };
    });
    setScreen('photos');
  };

  const handlePhotosContinue = (photos: string[]) => {
    setActiveVisit((prev) => (prev ? { ...prev, photos } : null));
    setScreen('summary');
  };

  const handleFinishVisit = () => {
    if (activeVisit && selectedVisit) {
      const visit = driverAppData.todayVisits.find((v) => v.id === activeVisit.visitId);
      if (visit) {
        visit.status = activeVisit.status === 'Delayed' ? 'Delayed' : 'Visited';
        visit.liters_collected = Number(activeVisit.liters) || 0;
        visit.receiver_name = activeVisit.receiverName;
        visit.receiver_dni = activeVisit.receiverDni;
        visit.payment_amount = activeVisit.totalOilPayment || 0;
        visit.oil_paid = activeVisit.oilPaid;
        visit.oil_amount = activeVisit.totalOilPayment || 0;
        visit.products_delivered = activeVisit.products;
        visit.observations = activeVisit.observations;
        visit.photos = activeVisit.photos;
        visit.gps_lat = activeVisit.gpsLat;
        visit.gps_lng = activeVisit.gpsLng;
        visit.visited_at = new Date().toISOString();
        visit.detergent_delivered = activeVisit.detergentDelivered;
        visit.detergent_quantity = Number(activeVisit.detergentQuantity) || 0;
      }
    }
    setScreen('receipt');
  };

  const handleContinueRoute = () => {
    setActiveVisit(null);
    setSelectedVisit(null);
    setScreen('route');
  };

  const handleCloseDay = () => {
    setScreen('home');
    setRouteStarted(false);
  };

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="relative">
      <MenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {screen === 'home' && (
        <HomeScreen
          routeStarted={routeStarted}
          onStartRoute={handleStartRoute}
          onOpenRoute={() => setScreen('route')}
          onOpenMenu={() => setMenuOpen(true)}
        />
      )}

      {screen === 'route' && (
        <RouteScreen
          onSelectVisit={handleSelectVisit}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'detail' && selectedVisit && (
        <DetailScreen
          visit={selectedVisit}
          onBack={() => setScreen('route')}
          onStartVisit={handleStartVisit}
        />
      )}

      {screen === 'startVisit' && activeVisit && selectedVisit && (
        <StartVisitScreen
          visit={selectedVisit}
          onBack={() => setScreen('detail')}
          onContinue={handleStartVisitContinue}
        />
      )}

      {screen === 'delayed' && activeVisit && selectedVisit && (
        <DelayedScreen
          visit={selectedVisit}
          activeVisit={activeVisit}
          onBack={() => setScreen('startVisit')}
          onContinue={handleDelayedContinue}
        />
      )}

      {screen === 'collect' && activeVisit && (
        <CollectScreen
          activeVisit={activeVisit}
          onBack={() => setScreen('startVisit')}
          onContinue={handleCollectContinue}
        />
      )}

      {screen === 'photos' && activeVisit && (
        <PhotosScreen
          activeVisit={activeVisit}
          onBack={() => setScreen('collect')}
          onContinue={handlePhotosContinue}
        />
      )}

      {screen === 'summary' && activeVisit && (
        <SummaryScreen
          activeVisit={activeVisit}
          onBack={() => setScreen('photos')}
          onFinish={handleFinishVisit}
        />
      )}

      {screen === 'receipt' && activeVisit && (
        <ReceiptScreen
          activeVisit={activeVisit}
          selectedVisit={selectedVisit}
          onContinueRoute={handleContinueRoute}
        />
      )}

      {screen === 'endDay' && (
        <EndDayScreen onCloseDay={handleCloseDay} />
      )}

      {screen === 'history' && (
        <HistoryScreen onBack={() => setScreen('home')} />
      )}

      {screen === 'profile' && (
        <ProfileScreen onBack={() => setScreen('home')} />
      )}
    </div>
  );
}