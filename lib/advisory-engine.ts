import { HealthAdvisoryResult, HealthSensitivity } from './types';

export function generateHealthAdvisory(
  currentAQI: number,
  predictedAQI: number,
  age?: number,
  healthSensitivity: HealthSensitivity = 'None'
): HealthAdvisoryResult {
  const maxAQI = Math.max(currentAQI, predictedAQI);
  const isSenior = age !== undefined && age >= 60;
  const isChild = age !== undefined && age <= 14;
  const hasCondition = healthSensitivity !== 'None';

  let overallRisk: HealthAdvisoryResult['overallRisk'] = 'Low';
  let generalAdvice = '';
  let outdoorStatus: 'Safe' | 'Caution' | 'Avoid' = 'Safe';
  let outdoorDetails = '';
  let maskRecommended = false;
  let maskType = 'None needed';
  let maskDetails = '';
  let ventStatus: 'Open Windows' | 'Limited Ventilation' | 'Keep Windows Closed' = 'Open Windows';
  let ventDetails = '';
  const activitiesToAvoid: string[] = [];
  const recommendedActions: string[] = [];

  if (maxAQI <= 50) {
    overallRisk = 'Low';
    generalAdvice = 'Air quality is considered satisfactory, and air pollution poses little or no risk. Great conditions for outdoor sports and recreational activities.';
    outdoorStatus = 'Safe';
    outdoorDetails = 'Ideal weather and clean air for outdoor running, cycling, sports, and open-air gatherings.';
    maskRecommended = false;
    maskDetails = 'Ambient particulate levels are well within safe thresholds. No filtration mask required.';
    ventStatus = 'Open Windows';
    ventDetails = 'Recommended to ventilate indoor living spaces and let in fresh air.';
    recommendedActions.push('Enjoy outdoor recreation and exercises', 'Ventilate indoor living spaces', 'Maintain normal daily routines');
  } else if (maxAQI <= 100) {
    overallRisk = hasCondition || isSenior || isChild ? 'Moderate' : 'Low';
    generalAdvice = 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of unusually sensitive individuals.';
    outdoorStatus = hasCondition ? 'Caution' : 'Safe';
    outdoorDetails = hasCondition
      ? 'Unusually sensitive individuals should consider taking more breaks during intense outdoor workouts.'
      : 'Generally safe for all outdoor physical activities.';
    maskRecommended = hasCondition;
    maskType = hasCondition ? 'Surgical or particulate mask for sensitive routes' : 'None needed';
    maskDetails = hasCondition ? 'Sensitive individuals along high-traffic corridors may benefit from light respiratory filtration.' : 'Not required for healthy population.';
    ventStatus = 'Limited Ventilation';
    ventDetails = 'Natural ventilation is acceptable; avoid opening windows facing high-traffic corridors during morning peak rush hours.';
    if (hasCondition) {
      activitiesToAvoid.push('Prolonged high-intensity cardio directly next to congested traffic corridors');
    }
    recommendedActions.push('Monitor breathing symptoms if prone to allergies', 'Prefer parks and green spaces over busy roadways for workouts');
  } else if (maxAQI <= 150) {
    overallRisk = hasCondition || isSenior || isChild ? 'High' : 'Moderate';
    generalAdvice = 'Members of sensitive groups may experience health effects. The general public is less likely to be affected, but outdoor exposure should still be calculated.';
    outdoorStatus = 'Caution';
    outdoorDetails = hasCondition || isSenior || isChild
      ? 'Sensitive groups should reduce prolonged or heavy outdoor exertion. Reschedule strenuous outdoor sports.'
      : 'Healthy individuals can continue outdoor workouts, but consider reducing duration.';
    maskRecommended = true;
    maskType = 'N95 / KN95 Respirator';
    maskDetails = 'Recommended for individuals with respiratory or cardiovascular sensitivity when outside for more than 30 minutes.';
    ventStatus = 'Limited Ventilation';
    ventDetails = 'Keep windows closed during morning and evening rush hours. Run indoor HEPA air purifiers if available.';
    activitiesToAvoid.push(
      'Outdoor sprint training or marathon conditioning',
      'Prolonged playtime for toddlers and young children outdoors',
      'Open-air dining near high-emissions traffic rings'
    );
    recommendedActions.push(
      'Shift strenuous cardio workouts to indoor fitness centers',
      'Keep prescribed inhalers or allergy medications readily available',
      'Stay well-hydrated to aid mucosal particulate clearance'
    );
  } else if (maxAQI <= 200) {
    overallRisk = 'High';
    generalAdvice = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects. Protective precautions strongly advised.';
    outdoorStatus = 'Avoid';
    outdoorDetails = 'Avoid prolonged outdoor physical exertion. Sensitive groups should remain indoors in air-filtered spaces.';
    maskRecommended = true;
    maskType = 'Certified N95 / FFP2 Respirator';
    maskDetails = 'A well-fitted N95 respirator is strongly advised for anyone stepping outside, creating an airtight seal against fine PM2.5 particulates.';
    ventStatus = 'Keep Windows Closed';
    ventDetails = 'Keep windows and doors securely closed. Set air conditioning units to internal recirculate mode.';
    activitiesToAvoid.push(
      'All outdoor sports, running, cycling, and strenuous manual labor',
      'Outdoor morning walks without certified respiratory protection',
      'Ventilating rooms with unfiltered outdoor air'
    );
    recommendedActions.push(
      'Run HEPA air purifiers continuously on auto/medium mode',
      'Wear a tightly-fitted N95 mask for any unavoidable outdoor travel',
      'Use saline nasal irrigation to rinse deposited particulates'
    );
  } else {
    overallRisk = 'Severe';
    generalAdvice = 'Health warning of emergency conditions. The entire population is likely to be significantly affected. Severe respiratory irritation and cardiovascular stress are probable.';
    outdoorStatus = 'Avoid';
    outdoorDetails = 'Mandatory avoidance of all outdoor exposure. Stay strictly inside sealed, filtered environments.';
    maskRecommended = true;
    maskType = 'N95 / N99 / P100 Respirator with tight seal';
    maskDetails = 'Critical for any outdoor transit. Standard cloth or simple 3-ply surgical masks offer insufficient protection against severe PM2.5.';
    ventStatus = 'Keep Windows Closed';
    ventDetails = 'Strictly seal windows, doors, and exhaust vents. Maximize indoor HEPA filtration.';
    activitiesToAvoid.push(
      'Any outdoor physical presence, walking, or commuting on two-wheelers',
      'Opening balcony doors or natural ventilation',
      'Engaging in strenuous indoor activities without active air purification'
    );
    recommendedActions.push(
      'Remain indoors within sealed rooms equipped with true HEPA filters',
      'Vulnerable individuals should have emergency medical contact protocols active',
      'Consume antioxidant-rich fluids and maintain adequate indoor humidity (40-50%)'
    );
  }

  // Condition-specific guidance
  let conditionAdvice = '';
  switch (healthSensitivity) {
    case 'Asthma':
      conditionAdvice = maxAQI > 100
        ? 'High particulate count can trigger airway hyper-responsiveness and bronchospasms. Keep your quick-relief bronchodilator / rescue inhaler at hand at all times and monitor peak flow values.'
        : 'Asthmatic response risk is low. Maintain standard baseline controller medication as prescribed by your physician.';
      break;
    case 'Respiratory sensitivity':
      conditionAdvice = maxAQI > 100
        ? 'Elevated ozone and nitrogen dioxide irritate bronchial epithelial linings. Avoid deep outdoor breathing exercises and use saline gargles post-exposure.'
        : 'Respiratory risk is low. Normal activities can proceed safely.';
      break;
    case 'Heart condition':
      conditionAdvice = maxAQI > 100
        ? 'Ultra-fine PM2.5 can cross the alveolar-capillary barrier into bloodstream, elevating arterial stiffness and thrombotic stress. Avoid heavy physical lifting and reduce outdoor cardiac strain.'
        : 'Cardiac strain from air pollution is currently baseline. Continue balanced daily routine.';
      break;
    case 'Allergy sensitivity':
      conditionAdvice = maxAQI > 100
        ? 'Combined airborne allergens and particulates can cause conjunctivitis, rhinitis, and sinus congestion. Use protective eyewear when traveling and wash face after arriving indoors.'
        : 'Allergen-particulate synergy is low. Outdoor exposure is well tolerated.';
      break;
    default:
      conditionAdvice = isSenior
        ? 'Senior cardiovascular systems are more sensitive to micro-particulates. Keep outdoor walks brief during peak sunshine or evening inversion.'
        : isChild
        ? 'Children breathe more air per pound of body weight. Minimize playground sports during elevated pollution periods.'
        : 'General population guidelines apply. Maintain awareness of hourly AQI trends.';
      break;
  }

  return {
    overallRisk,
    generalAdvice,
    outdoorActivities: {
      status: outdoorStatus,
      details: outdoorDetails
    },
    maskAdvice: {
      recommended: maskRecommended,
      maskType,
      details: maskDetails
    },
    ventilationAdvice: {
      status: ventStatus,
      details: ventDetails
    },
    sensitiveGroupAdvice: {
      condition: healthSensitivity,
      details: conditionAdvice
    },
    activitiesToAvoid,
    recommendedActions,
    disclaimer: 'Disclaimer: This environmental advisory provides general air-quality guidance based on public health indices (US EPA & WHO benchmarks). It does not constitute formal medical diagnosis, clinical prescription, or personalized medical care. Always consult qualified healthcare professionals for medical conditions.'
  };
}
