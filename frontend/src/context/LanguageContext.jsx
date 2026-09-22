import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    nav_home: "Home",
    nav_elections: "Elections",
    nav_verify: "Verify Receipt",
    nav_login: "Sign In",
    nav_register: "Register Identity",
    nav_dashboard: "Dashboard",
    nav_admin: "Admin Hub",
    nav_logout: "Disconnect",
    hero_title: "Biometric Sovereign Democracy for the AI Era",
    hero_subtitle: "Zero-knowledge cryptographic voting secured by browser-native facial liveness, two-factor OTP verification, and immutable receipts.",
    hero_cta_vote: "Cast Your Ballot",
    hero_cta_register: "Enroll Digital Identity",
    stat_turnout: "Voter Turnout",
    stat_votes: "Sealed Ballots",
    stat_voters: "Registered Voters",
    stat_active_elections: "Active Elections",
    election_active: "Active Election",
    election_upcoming: "Upcoming",
    election_completed: "Completed",
    btn_vote_now: "Vote Now",
    btn_view_details: "View Details",
    btn_download_pdf: "Download Official Receipt (PDF)",
    face_scanning: "Scanning Facial Biometrics...",
    face_blink_prompt: "Please blink naturally",
    face_turn_prompt: "Turn head slightly to the right",
    face_verified: "Biometric Liveness Verified",
    receipt_title: "Official Voting Receipt",
    receipt_hash: "SHA-256 Cryptographic Seal",
  },
  es: {
    nav_home: "Inicio",
    nav_elections: "Elecciones",
    nav_verify: "Verificar Recibo",
    nav_login: "Iniciar Sesión",
    nav_register: "Registrar Identidad",
    nav_dashboard: "Panel",
    nav_admin: "Centro Admin",
    nav_logout: "Cerrar Sesión",
    hero_title: "Democracia Biométrica Soberana para la Era de la IA",
    hero_subtitle: "Votación criptográfica de conocimiento cero asegurada por biometría facial en el navegador, OTP de doble factor y recibos inmutables.",
    hero_cta_vote: "Emitir Voto",
    hero_cta_register: "Inscribir Identidad",
    stat_turnout: "Participación",
    stat_votes: "Votos Sellados",
    stat_voters: "Votantes Registrados",
    stat_active_elections: "Elecciones Activas",
    election_active: "Elección Activa",
    election_upcoming: "Próxima",
    election_completed: "Completada",
    btn_vote_now: "Votar Ahora",
    btn_view_details: "Ver Detalles",
    btn_download_pdf: "Descargar Recibo (PDF)",
    face_scanning: "Escaneando Biometría Facial...",
    face_blink_prompt: "Por favor parpadee naturalmente",
    face_turn_prompt: "Gire la cabeza ligeramente a la derecha",
    face_verified: "Biometría y Vitalidad Verificadas",
    receipt_title: "Recibo Oficial de Votación",
    receipt_hash: "Sello Criptográfico SHA-256",
  },
  hi: {
    nav_home: "होम",
    nav_elections: "चुनाव",
    nav_verify: "रसीद सत्यापित करें",
    nav_login: "लॉग इन",
    nav_register: "पहचान दर्ज करें",
    nav_dashboard: "डैशबोर्ड",
    nav_admin: "एडमिन हब",
    nav_logout: "लॉग आउट",
    hero_title: "एआई युग के लिए सुरक्षित बायोमेट्रिक लोकतांत्रिक मतदान",
    hero_subtitle: "ब्राउज़र-आधारित फेशियल लाइवनेस, दो-चरणीय ओटीपी सत्यापन और अपरिवर्तनीय डिजिटल रसीदों द्वारा सुरक्षित।",
    hero_cta_vote: "मतदान करें",
    hero_cta_register: "डिजिटल पहचान जोड़ें",
    stat_turnout: "मतदान प्रतिशत",
    stat_votes: "डाले गए मत",
    stat_voters: "पंजीकृत मतदाता",
    stat_active_elections: "सक्रिय चुनाव",
    election_active: "सक्रिय चुनाव",
    election_upcoming: "आगामी",
    election_completed: "समाप्त",
    btn_vote_now: "अभी वोट दें",
    btn_view_details: "विवरण देखें",
    btn_download_pdf: "रसीद डाउनलोड करें (PDF)",
    face_scanning: "चेहरा स्कैन हो रहा है...",
    face_blink_prompt: "कृपया सामान्य रूप से पलकें झपकाएं",
    face_turn_prompt: "सिर को थोड़ा दाईं ओर घुमाएं",
    face_verified: "बायोमेट्रिक लाइवनेस सत्यापित",
    receipt_title: "आधिकारिक मतदान रसीद",
    receipt_hash: "SHA-256 क्रिप्टोग्राफिक सील",
  },
  fr: {
    nav_home: "Accueil",
    nav_elections: "Élections",
    nav_verify: "Vérifier le Reçu",
    nav_login: "Connexion",
    nav_register: "Créer une Identité",
    nav_dashboard: "Tableau de Bord",
    nav_admin: "Centre Admin",
    nav_logout: "Déconnexion",
    hero_title: "Démocratie Biométrique Sécurisée à l'Ère de l'IA",
    hero_subtitle: "Vote cryptographique à divulgation nulle de connaissance avec reconnaissance faciale dans le navigateur et reçus infalsifiables.",
    hero_cta_vote: "Voter Maintenant",
    hero_cta_register: "Enregistrer l'Identité",
    stat_turnout: "Participation",
    stat_votes: "Bulletins Scellés",
    stat_voters: "Électeurs Inscrits",
    stat_active_elections: "Élections Actives",
    election_active: "Élection Active",
    election_upcoming: "À venir",
    election_completed: "Terminée",
    btn_vote_now: "Voter",
    btn_view_details: "Voir les Détails",
    btn_download_pdf: "Télécharger le Reçu (PDF)",
    face_scanning: "Scan Biométrique du Visage...",
    face_blink_prompt: "Veuillez cligner des yeux naturellement",
    face_turn_prompt: "Tournez légèrement la tête vers la droite",
    face_verified: "Biométrie et Vitalité Validées",
    receipt_title: "Reçu Officiel de Vote",
    receipt_hash: "Sceau Cryptographique SHA-256",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('smartvote_lang') || 'en');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('smartvote_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      if (lang === 'hi') utterance.lang = 'hi-IN';
      else if (lang === 'es') utterance.lang = 'es-ES';
      else if (lang === 'fr') utterance.lang = 'fr-FR';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, speak, voiceEnabled, setVoiceEnabled }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
