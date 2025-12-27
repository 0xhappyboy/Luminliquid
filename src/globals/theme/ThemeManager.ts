class ThemeManager {
    private static instance: ThemeManager;
    private currentTheme: 'dark' | 'light' = 'dark';
    private subscribers: Array<(theme: 'dark' | 'light') => void> = [];

    private constructor() {
        this.loadTheme();
    }

    static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }

    getTheme(): 'dark' | 'light' {
        return this.currentTheme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme: 'dark' | 'light') {
        this.currentTheme = theme;
        this.applyThemeToDocument();
        this.notifySubscribers();
        this.saveTheme();

        window.dispatchEvent(new CustomEvent('globalThemeChange', {
            detail: { theme }
        }));
    }

    private applyThemeToDocument() {
        const html = document.documentElement;
        if (this.currentTheme === 'dark') {
            html.classList.add('bp4-dark');
            html.classList.remove('bp4-light');
        } else {
            html.classList.add('bp4-light');
            html.classList.remove('bp4-dark');
        }
    }

    subscribe(callback: (theme: 'dark' | 'light') => void) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    private notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.currentTheme);
            } catch (error) {
                console.error('Error in theme subscriber:', error);
            }
        });
    }

    private saveTheme() {
        localStorage.setItem('app-theme', this.currentTheme);
    }

    private loadTheme() {
        const savedTheme = localStorage.getItem('app-theme') as 'dark' | 'light';
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyThemeToDocument();
        }
    }
}

export const themeManager = ThemeManager.getInstance();