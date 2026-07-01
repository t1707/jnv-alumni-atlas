import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  en: {
    "brand": "JNV Kuchaman Alumni Directory",
    "nav.submit": "Submit",
    "nav.visualize": "Explore map",
    "nav.admin": "Admin",
    "lang.toggle": "हिन्दी",

    // Index
    "index.hero.title": "Reconnect with your batchmates.",
    "index.hero.subtitle": "Share where life has taken you. Your details help us build a directory of JNV Kuchaman alumni — from teachers and doctors to engineers and officers across the country.",
    "index.cta.explore": "Explore the alumni map",
    "index.form.title": "Your details",
    "index.form.required": "Fields marked * are required.",
    "index.field.name": "Full name *",
    "index.placeholder.name": "your name",
    "index.field.batch": "Batch (passout year) *",
    "index.field.mobile": "Mobile number *",
    "index.field.email": "Email (optional)",
    "index.field.address": "Address *",
    "index.field.occupation": "Occupation",
    "index.field.department": "Department / Firm",
    "index.field.post": "Post / Role",
    "index.field.postingPlace": "Posting place / Work location",
    "index.field.remarks": "Remarks (optional)",
    "index.submit": "Submit details",
    "index.submitting": "Submitting…",
    "index.success.title": "You're in the directory.",
    "index.success.body": "Thanks for sharing your details. They've been added to the alumni list.",
    "index.success.another": "Submit another entry",
    "index.toast.success": "Submitted! Thank you for joining the directory.",
    "index.footer": "JNV Kuchaman Alumni Directory · Built with care for the JNV Kuchaman community.",

    // Visualize
    "viz.title": "Explore the alumni network",
    "viz.subtitle": "Search by name or pan and zoom the map to see where alumni live and work.",
    "viz.loading": "Loading directory…",
    "viz.error": "Couldn't load directory. Please try again.",
    "viz.tab.search": "Search",
    "viz.tab.map": "Map",
    "viz.search.placeholder": "Search by name, batch, occupation, place…",
    "viz.filter.allBatches": "All batches",
    "viz.filter.batch": "Batch",
    "viz.noMatches": "No matches.",
    "viz.showing": "Showing",
    "viz.of": "of",
    "viz.howto.title": "How to use",
    "viz.howto.zoom": "Click India / Rajasthan / Ajmer for quick zoom.",
    "viz.howto.pan": "Scroll or use +/− to zoom; drag to pan.",
    "viz.howto.click": "Click a pin to see alumni in that city.",
    "viz.stats.cities": "cities mapped",
    "viz.stats.placed": "alumni placed",
    "viz.stats.unplaced": "without a recognized city",
    "viz.clear": "Clear",
    "viz.alumniCount": "alumni",
  },
  hi: {
    "brand": "जे.एन.वी. कुचामन पूर्व छात्र निर्देशिका",
    "nav.submit": "विवरण भरें",
    "nav.visualize": "मानचित्र देखें",
    "nav.admin": "एडमिन",
    "lang.toggle": "English",

    // Index
    "index.hero.title": "अपने सहपाठियों से पुनः जुड़ें।",
    "index.hero.subtitle": "अपनी जीवन-यात्रा साझा करें। आपके विवरण से हम पूरे देश में फैले जे.एन.वी. कुचामन के पूर्व छात्रों — शिक्षकों, डॉक्टरों, इंजीनियरों और अधिकारियों — की निर्देशिका तैयार कर पाएँगे।",
    "index.cta.explore": "पूर्व छात्र मानचित्र देखें",
    "index.form.title": "आपका विवरण",
    "index.form.required": "* चिह्नित फ़ील्ड भरना अनिवार्य है।",
    "index.field.name": "पूरा नाम *",
    "index.placeholder.name": "आपका नाम",
    "index.field.batch": "बैच (पासआउट वर्ष) *",
    "index.field.mobile": "मोबाइल नंबर *",
    "index.field.email": "ईमेल (वैकल्पिक)",
    "index.field.address": "पता *",
    "index.field.occupation": "व्यवसाय",
    "index.field.department": "विभाग / संस्था",
    "index.field.post": "पद",
    "index.field.postingPlace": "तैनाती स्थान / कार्यस्थल",
    "index.field.remarks": "टिप्पणी (वैकल्पिक)",
    "index.submit": "विवरण भेजें",
    "index.submitting": "भेजा जा रहा है…",
    "index.success.title": "आप निर्देशिका में शामिल हो गए हैं।",
    "index.success.body": "विवरण साझा करने के लिए धन्यवाद। आपका नाम सूची में जोड़ दिया गया है।",
    "index.success.another": "एक और प्रविष्टि भेजें",
    "index.toast.success": "धन्यवाद! आपका विवरण निर्देशिका में जुड़ गया है।",
    "index.footer": "जे.एन.वी. कुचामन पूर्व छात्र निर्देशिका · जे.एन.वी. कुचामन समुदाय के लिए सादर निर्मित।",

    // Visualize
    "viz.title": "पूर्व छात्र नेटवर्क देखें",
    "viz.subtitle": "नाम से खोजें या मानचित्र को घुमाकर/ज़ूम करके देखें कि पूर्व छात्र कहाँ रहते और कार्य करते हैं।",
    "viz.loading": "निर्देशिका लोड हो रही है…",
    "viz.error": "निर्देशिका लोड नहीं हो सकी। कृपया पुनः प्रयास करें।",
    "viz.tab.search": "खोजें",
    "viz.tab.map": "मानचित्र",
    "viz.search.placeholder": "नाम, बैच, व्यवसाय, स्थान से खोजें…",
    "viz.filter.allBatches": "सभी बैच",
    "viz.filter.batch": "बैच",
    "viz.noMatches": "कोई परिणाम नहीं।",
    "viz.showing": "दिखा रहे हैं",
    "viz.of": "में से",
    "viz.howto.title": "उपयोग कैसे करें",
    "viz.howto.zoom": "त्वरित ज़ूम के लिए India / Rajasthan / Ajmer पर क्लिक करें।",
    "viz.howto.pan": "ज़ूम के लिए स्क्रॉल या +/− दबाएँ; घुमाने के लिए खींचें।",
    "viz.howto.click": "उस शहर के पूर्व छात्र देखने के लिए पिन पर क्लिक करें।",
    "viz.stats.cities": "शहर मानचित्र पर",
    "viz.stats.placed": "पूर्व छात्र स्थित",
    "viz.stats.unplaced": "बिना पहचाने गए शहर वाले",
    "viz.clear": "हटाएँ",
    "viz.alumniCount": "पूर्व छात्र",
  },
};

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved === "en" || saved === "hi") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };

  const t = (key: string) => translations[lang][key] ?? translations.en[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useI18n() {
  return useContext(LangContext);
}

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className={
        "rounded-md border border-primary-foreground/30 px-2 py-1 text-xs font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 " +
        (className ?? "")
      }
      aria-label="Toggle language"
    >
      {t("lang.toggle")}
    </button>
  );
}
