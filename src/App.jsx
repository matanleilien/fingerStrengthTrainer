import { useState, useEffect } from 'react';
import Onboarding from './pages/Onboarding';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Progress from './pages/Progress';
import UserSelect from './pages/UserSelect';
import { getUserProfile, resetAllData, initActiveUser, migrateLegacyData } from './utils/storage';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [currentWorkout, setCurrentWorkout] = useState(null);

  useEffect(() => {
    // Migrate legacy single-user data if present
    if (migrateLegacyData()) {
      // Legacy data migrated into a user, go straight to dashboard
      setScreen('dashboard');
      return;
    }

    // Check for active user
    const activeId = initActiveUser();
    if (!activeId) {
      setScreen('user-select');
      return;
    }

    const profile = getUserProfile();
    if (!profile) {
      setScreen('onboarding');
    } else {
      setScreen('dashboard');
    }
  }, []);

  function handleUserSelected() {
    const profile = getUserProfile();
    if (!profile) {
      setScreen('onboarding');
    } else {
      setScreen('dashboard');
    }
  }

  function handleSwitchUser() {
    setCurrentWorkout(null);
    setScreen('user-select');
  }

  function handleOnboardingComplete() {
    setScreen('assessment');
  }

  function handleAssessmentComplete() {
    setScreen('dashboard');
  }

  function handleStartWorkout(workout) {
    setCurrentWorkout(workout);
    setScreen('workout');
  }

  function handleWorkoutComplete() {
    setCurrentWorkout(null);
    setScreen('dashboard');
  }

  function handleWorkoutCancel() {
    setCurrentWorkout(null);
    setScreen('dashboard');
  }

  function handleStartAssessment() {
    setScreen('assessment');
  }

  function handleViewProgress() {
    setScreen('progress');
  }

  function handleReset() {
    if (window.confirm('Reset all training data for this user? This cannot be undone.')) {
      resetAllData();
      setScreen('onboarding');
    }
  }

  if (screen === 'loading') {
    return (
      <div className="app loading">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="app">
      {screen === 'user-select' && (
        <UserSelect onUserSelected={handleUserSelected} />
      )}
      {screen === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      {screen === 'assessment' && (
        <Assessment onComplete={handleAssessmentComplete} />
      )}
      {screen === 'dashboard' && (
        <Dashboard
          onStartWorkout={handleStartWorkout}
          onStartAssessment={handleStartAssessment}
          onViewProgress={handleViewProgress}
          onReset={handleReset}
          onSwitchUser={handleSwitchUser}
        />
      )}
      {screen === 'workout' && currentWorkout && (
        <Workout
          workout={currentWorkout}
          onComplete={handleWorkoutComplete}
          onCancel={handleWorkoutCancel}
        />
      )}
      {screen === 'progress' && (
        <Progress onBack={() => setScreen('dashboard')} />
      )}
    </div>
  );
}
