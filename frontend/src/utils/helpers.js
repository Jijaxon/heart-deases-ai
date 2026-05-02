/** Risk darajasiga rang beradi */
export const getRiskColor = (score) => {
  if (score >= 70) return '#e53e3e'
  if (score >= 40) return '#d69e2e'
  return '#38a169'
}

export const getRiskBadgeClass = (level) => {
  const map = { 'Yuqori': 'badge-red', 'O\'rta': 'badge-yellow', 'Past': 'badge-green' }
  return map[level] || 'badge-gray'
}

export const getPredictionBadge = (prediction) =>
  prediction === 1 ? 'badge-red' : 'badge-green'

export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const formatPercent = (val) => `${Number(val).toFixed(1)}%`

/** KMeans klaster ranglar */
export const KMEANS_COLORS = ['#38a169', '#d69e2e', '#e53e3e']

/** DBSCAN klaster ranglar */
export const DBSCAN_COLORS = ['#3182ce', '#805ad5', '#d69e2e', '#38a169']

/** Feature izohlar o'zbek tilida */
export const FEATURE_DESCRIPTIONS = {
  age: 'Yosh',
  sex: 'Jins',
  cp: 'Ko\'krak og\'rig\'i',
  trestbps: 'Qon bosimi (mm Hg)',
  chol: 'Xolesterin (mg/dl)',
  fbs: 'Och qoringa qand',
  restecg: 'EKG natijasi',
  thalach: 'Maks. yurak urishi',
  exang: 'Mashq angina',
  oldpeak: 'ST depressiya',
  slope: 'ST slope',
  ca: 'Tomirlar soni',
  thal: 'Thalassemia'
}
