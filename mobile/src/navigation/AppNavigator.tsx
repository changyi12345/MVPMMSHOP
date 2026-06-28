import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import TabBar, { TabId } from '../components/TabBar';
import { colors } from '../theme/colors';
import { isMlbbUnified } from '../data/mlbb-regions';
import { hydrateAuth, isLoggedIn, clearAuth, loadPersistedLang } from '../api/auth';
import { getCartItemCount } from '../lib/cart-store';
import { initPushNotifications, teardownPushNotifications } from '../lib/push';
import { parseNotificationUrl } from '../lib/notification-navigation';
import { setLang, t } from '../i18n';
import HomeScreen from '../screens/HomeScreen';
import GamesScreen from '../screens/GamesScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import MlbbDetailScreen from '../screens/MlbbDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GuestProfileScreen from '../screens/GuestProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import WalletTopUpScreen from '../screens/WalletTopUpScreen';
import ReferralScreen from '../screens/ReferralScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LegalScreen from '../screens/LegalScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import VouchersScreen from '../screens/VouchersScreen';
import VoucherCategoryScreen from '../screens/VoucherCategoryScreen';
import VoucherDetailScreen from '../screens/VoucherDetailScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SplashScreen from '../screens/SplashScreen';

type AuthScreen = 'login' | 'register' | 'forgot-password';
type Screen =
  | { type: 'tabs' }
  | { type: 'game'; slug: string; imageUrl?: string | null }
  | { type: 'voucher-category'; categoryId: number; title: string }
  | { type: 'voucher'; id: number; categoryId?: number; categoryTitle?: string }
  | { type: 'checkout' }
  | { type: 'order'; id: string }
  | { type: 'wallet' }
  | { type: 'wallet-topup' }
  | { type: 'referral' }
  | { type: 'change-password' }
  | { type: 'notifications' }
  | { type: 'auth'; mode: AuthScreen }
  | { type: 'legal'; slug: string; title: string }
  | { type: 'events' }
  | { type: 'event'; slug: string };

export default function AppNavigator() {
  const [booting, setBooting] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [screen, setScreen] = useState<Screen>({ type: 'tabs' });
  const [loggedIn, setLoggedIn] = useState(false);
  const [cartRefreshKey, setCartRefreshKey] = useState(0);
  const [notifRefreshKey, setNotifRefreshKey] = useState(0);

  const bumpCart = () => setCartRefreshKey((k) => k + 1);
  const bumpNotif = () => setNotifRefreshKey((k) => k + 1);

  useEffect(() => {
    (async () => {
      const lang = await loadPersistedLang();
      if (lang === 'en' || lang === 'mm') setLang(lang);
      await hydrateAuth();
      setLoggedIn(isLoggedIn());
      setBooting(false);
    })();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      initPushNotifications().catch(() => {});
    }
  }, [loggedIn]);

  const goToTabs = (tab?: TabId) => {
    setScreen({ type: 'tabs' });
    if (tab) setActiveTab(tab);
    bumpCart();
  };

  const openGame = (slug: string, imageUrl?: string | null) => {
    setScreen({ type: 'game', slug, imageUrl });
  };

  const requireLogin = useCallback(
    (action: () => void, message = t('loginRequired')) => {
      if (loggedIn) {
        action();
        return;
      }
      Alert.alert(t('login'), message, [
        { text: t('no'), style: 'cancel' },
        { text: t('login'), onPress: () => setScreen({ type: 'auth', mode: 'login' }) },
      ]);
    },
    [loggedIn],
  );

  const handleOrderSuccess = (orderId: number) => {
    Alert.alert('Success', `Order #${orderId} placed successfully.`);
    goToTabs('orders');
  };

  const handleLogout = () => {
    teardownPushNotifications().catch(() => {});
    clearAuth();
    setLoggedIn(false);
    goToTabs('home');
  };

  const navigateFromNotificationUrl = useCallback((url: string) => {
    const target = parseNotificationUrl(url);
    if (!target) return;

    switch (target.kind) {
      case 'order':
        setScreen({ type: 'order', id: target.id });
        break;
      case 'wallet':
        setScreen({ type: 'wallet' });
        break;
      case 'wallet-topup':
        setScreen({ type: 'wallet-topup' });
        break;
      case 'orders-tab':
        goToTabs('orders');
        break;
      case 'profile-tab':
        goToTabs('profile');
        break;
      case 'cart-tab':
        goToTabs('cart');
        break;
      case 'events':
        setScreen({ type: 'events' });
        break;
      case 'event':
        setScreen({ type: 'event', slug: target.slug });
        break;
      case 'referral':
        setScreen({ type: 'referral' });
        break;
      default:
        break;
    }
  }, []);

  const handleAuthSuccess = () => {
    setLoggedIn(true);
    setScreen({ type: 'tabs' });
    initPushNotifications().catch(() => {});
  };

  const openNotifications = useCallback(() => {
    requireLogin(() => setScreen({ type: 'notifications' }));
  }, [requireLogin]);

  const openCheckout = () => {
    requireLogin(() => setScreen({ type: 'checkout' }));
  };

  const handleTabPress = (tab: TabId) => {
    if ((tab === 'orders' || tab === 'profile') && !loggedIn) {
      if (tab === 'profile') {
        setActiveTab('profile');
        setScreen({ type: 'tabs' });
        return;
      }
      requireLogin(() => setActiveTab(tab));
      return;
    }
    setActiveTab(tab);
    setScreen({ type: 'tabs' });
  };

  if (booting || showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const openVoucherCategory = (categoryId: number, title: string) => {
    setScreen({ type: 'voucher-category', categoryId, title });
  };

  const openVoucher = (id: number, categoryId?: number, categoryTitle?: string) => {
    setScreen({ type: 'voucher', id, categoryId, categoryTitle });
  };

  const renderOverlay = () => {
    switch (screen.type) {
      case 'auth': {
        if (screen.mode === 'register') {
          return (
            <RegisterScreen
              onSuccess={handleAuthSuccess}
              onLoginPress={() => setScreen({ type: 'auth', mode: 'login' })}
            />
          );
        }
        if (screen.mode === 'forgot-password') {
          return (
            <ForgotPasswordScreen onBack={() => setScreen({ type: 'auth', mode: 'login' })} />
          );
        }
        return (
          <LoginScreen
            onLogin={handleAuthSuccess}
            onRegisterPress={() => setScreen({ type: 'auth', mode: 'register' })}
            onForgotPassword={() => setScreen({ type: 'auth', mode: 'forgot-password' })}
            onBrowseGuest={() => goToTabs('home')}
          />
        );
      }
      case 'game':
        if (isMlbbUnified(screen.slug)) {
          return (
            <MlbbDetailScreen
              imageUrl={screen.imageUrl ?? null}
              onBack={() => goToTabs('games')}
              onCheckout={() => { bumpCart(); openCheckout(); }}
            />
          );
        }
        return (
          <GameDetailScreen
            slug={screen.slug}
            onBack={() => goToTabs('games')}
            onCheckout={() => { bumpCart(); openCheckout(); }}
          />
        );
      case 'voucher-category':
        return (
          <VoucherCategoryScreen
            categoryId={screen.categoryId}
            categoryTitle={screen.title}
            onBack={() => goToTabs('vouchers')}
            onVoucherPress={(id) => openVoucher(id, screen.categoryId, screen.title)}
          />
        );
      case 'voucher':
        return (
          <VoucherDetailScreen
            voucherId={screen.id}
            onBack={() => {
              if (screen.categoryId != null && screen.categoryTitle) {
                setScreen({
                  type: 'voucher-category',
                  categoryId: screen.categoryId,
                  title: screen.categoryTitle,
                });
              } else {
                goToTabs('vouchers');
              }
            }}
            onCheckout={() => { bumpCart(); openCheckout(); }}
          />
        );
      case 'checkout':
        return (
          <CheckoutScreen
            onBack={() => goToTabs('cart')}
            onSuccess={handleOrderSuccess}
          />
        );
      case 'order':
        return (
          <OrderDetailScreen
            orderId={screen.id}
            onBack={() => goToTabs('orders')}
            onCancelled={bumpNotif}
          />
        );
      case 'wallet':
        return (
          <WalletScreen
            onBack={() => goToTabs('profile')}
            onTopUp={() => setScreen({ type: 'wallet-topup' })}
          />
        );
      case 'wallet-topup':
        return (
          <WalletTopUpScreen
            onBack={() => setScreen({ type: 'wallet' })}
            onSuccess={() => setScreen({ type: 'wallet' })}
          />
        );
      case 'referral':
        return <ReferralScreen onBack={() => goToTabs('profile')} />;
      case 'change-password':
        return (
          <ChangePasswordScreen
            onBack={() => goToTabs('profile')}
            onSuccess={() => goToTabs('profile')}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => goToTabs(activeTab)}
            onRead={bumpNotif}
            onNavigate={navigateFromNotificationUrl}
          />
        );
      case 'legal':
        return (
          <LegalScreen
            slug={screen.slug}
            title={screen.title}
            onBack={() => goToTabs('profile')}
          />
        );
      case 'events':
        return (
          <EventsScreen
            onBack={() => goToTabs('home')}
            onEventPress={(slug) => setScreen({ type: 'event', slug })}
          />
        );
      case 'event':
        return (
          <EventDetailScreen
            slug={screen.slug}
            onBack={() => setScreen({ type: 'events' })}
          />
        );
      default:
        return null;
    }
  };

  const overlay = renderOverlay();
  if (overlay) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.flex}>{overlay}</View>
      </SafeAreaView>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onGamePress={(slug, imageUrl) => slug && openGame(slug, imageUrl)}
            onVoucherCategoryPress={openVoucherCategory}
            onViewAllGames={() => setActiveTab('games')}
            onViewAllVouchers={() => setActiveTab('vouchers')}
            onWalletPress={() => requireLogin(() => setScreen({ type: 'wallet' }))}
            onOrdersPress={() => requireLogin(() => setActiveTab('orders'))}
            onReferralPress={() => requireLogin(() => setScreen({ type: 'referral' }))}
            onEventsPress={() => setScreen({ type: 'events' })}
            onEventPress={(slug) => setScreen({ type: 'event', slug })}
            onNotificationsPress={openNotifications}
            notificationRefreshKey={notifRefreshKey}
          />
        );
      case 'games':
        return (
          <GamesScreen
            onGamePress={(slug, imageUrl) => openGame(slug, imageUrl)}
            onNotificationsPress={openNotifications}
            notificationRefreshKey={notifRefreshKey}
          />
        );
      case 'vouchers':
        return (
          <VouchersScreen
            onCategoryPress={openVoucherCategory}
            onNotificationsPress={openNotifications}
            notificationRefreshKey={notifRefreshKey}
          />
        );
      case 'cart':
        return (
          <CartScreen
            refreshKey={cartRefreshKey}
            onCheckout={openCheckout}
            onNotificationsPress={openNotifications}
            notificationRefreshKey={notifRefreshKey}
          />
        );
      case 'orders':
        return (
          <OrdersScreen
            onOrderPress={(id) => setScreen({ type: 'order', id })}
            onNotificationsPress={openNotifications}
            notificationRefreshKey={notifRefreshKey}
          />
        );
      case 'profile':
        return loggedIn ? (
          <ProfileScreen
            onLogout={handleLogout}
            onWalletPress={() => setScreen({ type: 'wallet' })}
            onReferralPress={() => setScreen({ type: 'referral' })}
            onOrdersPress={() => setActiveTab('orders')}
            onLegalPress={(slug, title) => setScreen({ type: 'legal', slug, title })}
            onChangePasswordPress={() => setScreen({ type: 'change-password' })}
            onEventsPress={() => setScreen({ type: 'events' })}
            onNotificationsPress={openNotifications}
            notificationRefreshKey={notifRefreshKey}
          />
        ) : (
          <GuestProfileScreen
            onLogin={() => setScreen({ type: 'auth', mode: 'login' })}
            onRegister={() => setScreen({ type: 'auth', mode: 'register' })}
            onLegalPress={(slug, title) => setScreen({ type: 'legal', slug, title })}
            onEventsPress={() => setScreen({ type: 'events' })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.flex}>{renderTab()}</View>
      <TabBar active={activeTab} onTabPress={handleTabPress} cartCount={getCartItemCount()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.headerDark },
  flex: { flex: 1 },
});
