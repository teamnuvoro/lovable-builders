import { useEffect, useState } from "react";
import { useLocation } from "wouter";

/**
 * 🔓 Frontend Backdoor Activator
 * 
 * This component provides multiple ways to activate the backdoor:
 * 1. URL parameter: ?backdoor=true
 * 2. Console command: window.enableBackdoor()
 * 3. Keyboard shortcut: Ctrl+Shift+B (or Cmd+Shift+B on Mac)
 * 4. Click sequence: Click logo 5 times
 */
export function BackdoorActivator() {
  const [location, setLocation] = useLocation();
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    // Check URL parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('backdoor') === 'true') {
      localStorage.setItem('backdoor_enabled', 'true');
      console.log('🔓 Backdoor activated via URL parameter');
      // Remove parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    // Expose global function to enable backdoor
    (window as any).enableBackdoor = () => {
      localStorage.setItem('backdoor_enabled', 'true');
      console.log('🔓 Backdoor enabled! Refresh the page.');
      alert('🔓 Backdoor enabled! Refresh the page to access protected routes.');
    };

    // Expose global function to disable backdoor
    (window as any).disableBackdoor = () => {
      localStorage.removeItem('backdoor_enabled');
      sessionStorage.removeItem('backdoor_enabled');
      console.log('🔒 Backdoor disabled!');
      alert('🔒 Backdoor disabled!');
      window.location.reload();
    };

    // Keyboard shortcut: Ctrl+Shift+B (or Cmd+Shift+B on Mac)
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        if (localStorage.getItem('backdoor_enabled') === 'true') {
          (window as any).disableBackdoor();
        } else {
          (window as any).enableBackdoor();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Click sequence handler (5 clicks on logo)
  const handleLogoClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        localStorage.setItem('backdoor_enabled', 'true');
        console.log('🔓 Backdoor activated via logo clicks!');
        alert('🔓 Backdoor activated! Refresh the page.');
        setClickCount(0);
        return 0;
      }
      return newCount;
    });
  };

  // Reset click count after 2 seconds
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  return null; // This component doesn't render anything visible
}

// Export helper functions for easy access
export const enableBackdoor = () => {
  localStorage.setItem('backdoor_enabled', 'true');
  console.log('🔓 Backdoor enabled! Refresh the page.');
};

export const disableBackdoor = () => {
  localStorage.removeItem('backdoor_enabled');
  sessionStorage.removeItem('backdoor_enabled');
  console.log('🔒 Backdoor disabled!');
};

