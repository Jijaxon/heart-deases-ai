import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Brain, ChevronDown, ChevronUp, Activity, AlertTriangle, CheckCircle, Info} from 'lucide-react'
import {predictDisease, clearPrediction} from '../store/slices/mlSlice'
import {getRiskColor} from '../utils/helpers'
import toast from 'react-hot-toast'

const FIELDS = [
	{key: 'age', label: 'Yosh', min: 1, max: 120, step: 1, type: 'number', hint: 'Bemorning yoshi'},
	{key: 'sex', label: 'Jins', options: [{v: 1, l: 'Erkak'}, {v: 0, l: 'Ayol'}]},
	{
		key: 'cp',
		label: "Ko'krak og'rig'i turi",
		options: [{v: 0, l: 'Tipik angina'}, {v: 1, l: 'Atipik angina'}, {v: 2, l: "Og'riq bo'lmagan"}, {
			v: 3,
			l: 'Asimptomatik'
		}]
	},
	{
		key: 'trestbps',
		label: 'Qon bosimi (mm Hg)',
		min: 50,
		max: 300,
		step: 1,
		type: 'number',
		hint: 'Normal: 120 dan past'
	},
	{key: 'chol', label: 'Xolesterin (mg/dl)', min: 100, max: 600, step: 1, type: 'number', hint: 'Normal: 200 dan past'},
	{key: 'fbs', label: "Och qoringa qand > 120 mg/dl", options: [{v: 1, l: 'Ha'}, {v: 0, l: "Yo'q"}]},
	{
		key: 'restecg',
		label: 'Tinch holatdagi EKG',
		options: [{v: 0, l: 'Normal'}, {v: 1, l: 'ST-T anormallik'}, {v: 2, l: "Chap qorincha gipertrofiyasi"}]
	},
	{
		key: 'thalach',
		label: 'Maksimal yurak urishi',
		min: 50,
		max: 250,
		step: 1,
		type: 'number',
		hint: 'Mashq paytidagi eng yuqori HR'
	},
	{key: 'exang', label: 'Mashq paytida angina', options: [{v: 1, l: 'Ha'}, {v: 0, l: "Yo'q"}]},
	{
		key: 'oldpeak',
		label: 'ST depressiya (oldpeak)',
		min: 0,
		max: 10,
		step: 0.1,
		type: 'number',
		hint: 'Mashqdan keyin ST depressiyasi'
	},
	{
		key: 'slope',
		label: 'ST segment slope',
		options: [{v: 0, l: "Yuqoriga ko'tariluvchi"}, {v: 1, l: 'Tekis'}, {v: 2, l: "Pastga tushuvchi"}]
	},
	{key: 'ca', label: 'Asosiy tomirlar soni', options: [{v: 0, l: '0'}, {v: 1, l: '1'}, {v: 2, l: '2'}, {v: 3, l: '3'}]},
	{
		key: 'thal',
		label: 'Thalassemia',
		options: [{v: 0, l: 'Normal'}, {v: 1, l: "Tuzatilgan nuqson"}, {v: 2, l: 'Tug\'ma'}, {v: 3, l: "Teskari nuqson"}]
	},
]

const DEFAULT_VALUES = {
	age: 32,
    sex: 0,
    cp: 3,
    trestbps: 115,
    chol: 170,
    fbs: 0,
    restecg: 0,
    thalach: 165,
    exang: 0,
    oldpeak: 0,
    slope: 2,
    ca: 0,
    thal: 2
}

function RiskMeter({score}) {
	const color = getRiskColor(score)
	return (
		<div style={{textAlign: 'center', padding: '1.5rem 0'}}>
			<div style={{
				position: 'relative',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 140,
				height: 140
			}}>
				<svg width="140" height="140" style={{transform: 'rotate(-90deg)'}}>
					<circle cx="70" cy="70" r="55" fill="none" stroke="var(--color-surface2)" strokeWidth="10"/>
					<circle cx="70" cy="70" r="55" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
					        strokeDasharray={`${2 * Math.PI * 55}`} strokeDashoffset={`${2 * Math.PI * 55 * (1 - score / 100)}`}
					        style={{transition: 'stroke-dashoffset 1s ease'}}/>
				</svg>
				<div style={{position: 'absolute', textAlign: 'center'}}>
					<div style={{fontSize: '1.8rem', fontWeight: 800, color}}>{score}</div>
					<div style={{fontSize: '0.7rem', color: 'var(--color-text-muted)'}}>/ 100</div>
				</div>
			</div>
			<div style={{fontSize: '0.85rem', fontWeight: 600, color, marginTop: '0.5rem'}}>Xavf balli</div>
		</div>
	)
}

export default function PredictPage() {
	const dispatch = useDispatch()
	const {prediction, predictLoading, predictError} = useSelector(s => s.ml)
	const [form, setForm] = useState(DEFAULT_VALUES)
	const [model, setModel] = useState('random_forest')
	const [showAll, setShowAll] = useState(false)

	const handlePredict = () => {
		dispatch(predictDisease({...form, model_name: model}))
	}

	const priorityColor = {high: '#e53e3e', medium: '#d69e2e', low: '#38a169'}

	return (
		<div className="animate-fade-in"
		     style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start'}}>

			{/* Form */}
			<div>
				<div style={{marginBottom: '1.5rem'}}>
					<h1 style={{fontSize: '1.4rem', fontWeight: 700}}>Prognoz Qilish</h1>
					<p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.2rem'}}>Bemor ma'lumotlarini
						kiriting</p>
				</div>

				{/* Model selector */}
				<div className="card" style={{marginBottom: '1rem', padding: '1rem'}}>
					<label style={{
						fontSize: '0.8rem',
						fontWeight: 500,
						color: 'var(--color-text-muted)',
						marginBottom: '0.5rem',
						display: 'block'
					}}>Model</label>
					<div style={{display: 'flex', gap: '0.5rem'}}>
						{['logistic_regression', 'random_forest', 'xgboost'].map(m => (
							<button key={m} className={`btn ${model === m ? 'btn-primary' : 'btn-secondary'}`}
							        style={{fontSize: '0.75rem', padding: '0.4rem 0.75rem'}} onClick={() => setModel(m)}>
								{m.replace('_', ' ')}
							</button>
						))}
					</div>
				</div>

				{/* Fields */}
				<div className="card">
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem'}}>
						{FIELDS.slice(0, showAll ? FIELDS.length : 8).map(f => (
							<div key={f.key}>
								<label style={{
									fontSize: '0.75rem',
									fontWeight: 500,
									color: 'var(--color-text-muted)',
									display: 'block',
									marginBottom: '0.3rem'
								}}>
									{f.label}
								</label>
								{f.options ? (
									<select className="input" value={form[f.key]}
									        onChange={e => setForm(v => ({...v, [f.key]: Number(e.target.value)}))}>
										{f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
									</select>
								) : (
									<input className="input" type={f.type} min={f.min} max={f.max} step={f.step} value={form[f.key]}
									       onChange={e => setForm(v => ({...v, [f.key]: Number(e.target.value)}))}/>
								)}
							</div>
						))}
					</div>

					<button className="btn btn-secondary" style={{width: '100%', marginTop: '0.75rem', fontSize: '0.8rem'}}
					        onClick={() => setShowAll(!showAll)}>
						{showAll ? <><ChevronUp size={14}/> Kamroq ko'rsatish</> : <><ChevronDown
							size={14}/> Barchasi ({FIELDS.length} ta maydon)</>}
					</button>

					<button className="btn btn-primary" onClick={handlePredict} disabled={predictLoading}
					        style={{width: '100%', padding: '0.875rem', marginTop: '0.875rem', fontSize: '0.95rem'}}>
						{predictLoading ? 'Tahlil qilinmoqda...' : <><Brain size={18}/> Prognoz Qilish</>}
					</button>
				</div>
			</div>

			{/* Result */}
			<div>
				{predictError && (
					<div className="card animate-fade-in"
					     style={{borderColor: 'rgba(229,62,62,0.4)', background: 'rgba(229,62,62,0.06)', marginBottom: '1rem'}}>
						<div style={{display: 'flex', gap: '0.5rem', color: '#fc8181'}}><AlertTriangle size={18}/>{predictError}
						</div>
					</div>
				)}

				{!prediction && !predictError && (
					<div className="card" style={{textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)'}}>
						<Brain size={48} style={{opacity: 0.2, margin: '0 auto 1rem'}}/>
						<p>Ma'lumotlarni to'ldiring va "Prognoz Qilish" tugmasini bosing</p>
					</div>
				)}

				{prediction && (
					<div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>

						{/* Main result - ⚠️ "Sog'lom — 11.9% ehtimol bilan" qismi O'CHIRILDI ⚠️ */}
						<div className="card" style={{
							borderColor: prediction.prediction === 1 ? 'rgba(229,62,62,0.5)' : 'rgba(56,161,105,0.5)',
							background: prediction.prediction === 1 ? 'rgba(229,62,62,0.05)' : 'rgba(56,161,105,0.05)'
						}}>
							{/* 👇 MATN O'CHIRILDI — FAQAT RISK METER QOLDI 👇 */}
							<RiskMeter score={prediction.risk_score}/>
						</div>

						{/* Top features */}
						<div className="card">
							<h3 style={{
								fontSize: '0.9rem',
								fontWeight: 600,
								marginBottom: '0.875rem',
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem'
							}}>
								<Info size={16} color="#3182ce"/> Asosiy omillar
							</h3>
							<div style={{display: 'flex', flexDirection: 'column', gap: '0.6rem'}}>
								{prediction.top_features?.map((f, i) => (
									<div key={i}>
										<div style={{
											display: 'flex',
											justifyContent: 'space-between',
											marginBottom: '0.25rem',
											fontSize: '0.82rem'
										}}>
											<span style={{color: 'var(--color-text)', fontWeight: 500}}>{f.feature}</span>
											<span style={{color: f.direction === 'xavfli' ? '#fc8181' : '#68d391', fontWeight: 600}}>
												{f?.value_label} ({f?.direction})
											</span>
										</div>
										<div style={{
											height: '6px',
											borderRadius: '3px',
											background: 'var(--color-surface2)',
											overflow: 'hidden'
										}}>
											<div style={{
												height: '100%',
												width: `${f.importance}%`,
												background: f.direction === 'xavfli' ? '#e53e3e' : '#38a169',
												borderRadius: '3px',
												transition: 'width 0.8s ease'
											}}/>
										</div>
										<div
											style={{fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right'}}>{f.importance}%
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Recommendations */}
						<div className="card">
							<h3 style={{fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.875rem'}}>💡 Tavsiyalar</h3>
							<div style={{display: 'flex', flexDirection: 'column', gap: '0.6rem'}}>
								{prediction.recommendations?.map((r, i) => (
									<div key={i} style={{
										padding: '0.75rem',
										borderRadius: '8px',
										background: 'var(--color-surface2)',
										borderLeft: `3px solid ${priorityColor[r.priority]}`
									}}>
										<div style={{
											fontSize: '0.75rem',
											fontWeight: 600,
											color: priorityColor[r.priority],
											marginBottom: '0.25rem'
										}}>
											{r.icon} {r.category}
										</div>
										<p style={{fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.5}}>{r.message}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}