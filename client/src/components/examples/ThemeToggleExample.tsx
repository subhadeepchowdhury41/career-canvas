import { ThemeProvider } from '@/lib/theme';
import { ThemeToggle } from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-muted-foreground">Toggle dark/light mode</span>
      </div>
    </ThemeProvider>
  );
}
