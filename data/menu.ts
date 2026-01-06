import { MenuItem } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  { title: "DISPLAY TESTS", path: "", isHeader: true },
  { title: "Dead Pixel Test", path: "/" },
  { title: "Uniformity", path: "/tests/uniformity" },
  { title: "Local Dimming / Blooming", path: "/tests/local-dimming" },
  { title: "Text Clarity", path: "/tests/text-clarity" },
  { title: "Color Gradient", path: "/tests/color-gradient" },
  { title: "Color Distance", path: "/tests/color-distance" },
  { title: "Response Time", path: "/tests/response-time" },
  { title: "Audio/Video Sync", path: "/tests/audio-sync" },
  { title: "Gamma", path: "/tests/gamma" },
  { title: "Test Patterns", path: "/tests/test-patterns" },
  { title: "Viewing Angle", path: "/tests/viewing-angle" },
  { title: "Brightness", path: "/tests/brightness" },
  { title: "Contrast", path: "/tests/contrast" },
  { title: "Matrix Rain", path: "/tests/matrix" },
  
  { title: "INPUT & GAMING", path: "", isHeader: true },
  { title: "Reaction Time", path: "/tools/reaction-time" },
  { title: "Mouse Polling Rate", path: "/tools/mouse-polling" },
  { title: "Keyboard Test", path: "/tools/keyboard" },
  { title: "Controller Test", path: "/tools/controller" },
  { title: "Touch Screen Test", path: "/tools/touch" },

  { title: "CALCULATORS", path: "", isHeader: true },
  { title: "PPI Calculator", path: "/tools/ppi-calculator" },

  { title: "BLOG", path: "", isHeader: true },
  { title: "Articles & Guides", path: "/blog" },
];