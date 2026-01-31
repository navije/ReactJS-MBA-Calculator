import React, { useState, useMemo } from 'react';

export default function MBANPVCalculator() {
  // Core assumptions - blank for manual entry
  const [discountRate, setDiscountRate] = useState('');
  const [bonusRate, setBonusRate] = useState('');
  const [fxGBPUSD, setFxGBPUSD] = useState('');
  const [fxGBPHKD, setFxGBPHKD] = useState('');
  
  // Tax rates (effective) - blank for manual entry
  const [taxUK, setTaxUK] = useState('');
  const [taxHK, setTaxHK] = useState('');
  const [taxUS, setTaxUS] = useState('');
  
  // UK Comp (GBP)
  const [ukAN1, setUkAN1] = useState(70000);
  const [ukAN2, setUkAN2] = useState(80000);
  const [ukAN3, setUkAN3] = useState(90000);
  const [ukAso1, setUkAso1] = useState(115000);
  const [ukAso2, setUkAso2] = useState(125000);
  const [ukAso3, setUkAso3] = useState(140000);
  const [ukVP1, setUkVP1] = useState(165000);
  const [ukVP2, setUkVP2] = useState(175000);
  const [ukVP3, setUkVP3] = useState(185000);
  const [ukDir, setUkDir] = useState(215000);
  
  // HK Comp (HKD)
  const [hkAN3, setHkAN3] = useState(1080000);
  const [hkAso1, setHkAso1] = useState(1200000);
  const [hkAso2, setHkAso2] = useState(1380000);
  const [hkAso3, setHkAso3] = useState(1500000);
  const [hkVP1, setHkVP1] = useState(1750000);
  const [hkVP2, setHkVP2] = useState(1850000);
  const [hkVP3, setHkVP3] = useState(1950000);
  const [hkDir, setHkDir] = useState(2200000);
  
  // US Comp (USD)
  const [usAN3, setUsAN3] = useState(150000);
  const [usAso1, setUsAso1] = useState(175000);
  const [usAso2, setUsAso2] = useState(200000);
  const [usAso3, setUsAso3] = useState(225000);
  const [usVP1, setUsVP1] = useState(250000);
  const [usVP2, setUsVP2] = useState(275000);
  const [usVP3, setUsVP3] = useState(290000);
  const [usDir, setUsDir] = useState(350000);
  
  // MBA Costs (USD) - blank for manual entry
  const [tuitionY1, setTuitionY1] = useState('');
  const [tuitionY2, setTuitionY2] = useState('');
  const [livingY1, setLivingY1] = useState('');
  const [livingY2, setLivingY2] = useState('');
  const [signingBonus, setSigningBonus] = useState('');
  
  const [activeTab, setActiveTab] = useState('assumptions');
  const [comparePath1, setComparePath1] = useState('UK → HK');
  const [comparePath2, setComparePath2] = useState('UK → MBA → US');

  // Helper: convert to GBP and calculate net
  const netIncome = (gross, taxRate) => {
    if (!gross || !taxRate || taxRate === '' || bonusRate === '') return 0;
    return gross * (1 + bonusRate/100) * (1 - taxRate/100);
  };
  const toUSD_GBP = (gbp) => {
    if (!fxGBPUSD || fxGBPUSD === '') return 0;
    return gbp * fxGBPUSD;
  };
  const toUSD_HKD = (hkd) => {
    if (!fxGBPHKD || fxGBPHKD === '' || !fxGBPUSD || fxGBPUSD === '') return 0;
    return (hkd * fxGBPUSD) / fxGBPHKD;
  };

  // Calculate cash flows for each scenario (in USD)
  const calculations = useMemo(() => {
    const r = discountRate && discountRate !== '' ? discountRate / 100 : 0;
    
    // Scenario 1: UK → HK (move after Y2)
    const hkCF = [
      toUSD_GBP(netIncome(ukAN1, taxUK)),
      toUSD_GBP(netIncome(ukAN2, taxUK)),
      netIncome(toUSD_HKD(hkAN3), taxHK),
      netIncome(toUSD_HKD(hkAso1), taxHK),
      netIncome(toUSD_HKD(hkAso2), taxHK),
      netIncome(toUSD_HKD(hkAso3), taxHK),
      netIncome(toUSD_HKD(hkVP1), taxHK),
      netIncome(toUSD_HKD(hkVP2), taxHK),
      netIncome(toUSD_HKD(hkVP3), taxHK),
      netIncome(toUSD_HKD(hkDir), taxHK),
    ];
    
    // Scenario 2: UK → MBA → US (MBA years 4-5, start US Y6)
    const mbaCostY1 = (tuitionY1 && tuitionY1 !== '' && livingY1 && livingY1 !== '') ? (tuitionY1 + livingY1) : 0;
    const mbaCostY2 = (tuitionY2 && tuitionY2 !== '' && livingY2 && livingY2 !== '') ? (tuitionY2 + livingY2) : 0;
    const mbaSigningUSD = (signingBonus && signingBonus !== '') ? signingBonus : 0;
    
    const mbaCF = [
      toUSD_GBP(netIncome(ukAN1, taxUK)),
      toUSD_GBP(netIncome(ukAN2, taxUK)),
      toUSD_GBP(netIncome(ukAN3, taxUK)),
      -mbaCostY1, // MBA Y1
      -mbaCostY2 + mbaSigningUSD, // MBA Y2 + signing
      netIncome(usAso1, taxUS),
      netIncome(usAso2, taxUS),
      netIncome(usAso3, taxUS),
      netIncome(usVP1, taxUS),
      netIncome(usVP2, taxUS),
    ];
    
    // Scenario 3: UK → US Direct (L-1 after Y2)
    const usDirectCF = [
      toUSD_GBP(netIncome(ukAN1, taxUK)),
      toUSD_GBP(netIncome(ukAN2, taxUK)),
      netIncome(usAN3, taxUS),
      netIncome(usAso1, taxUS),
      netIncome(usAso2, taxUS),
      netIncome(usAso3, taxUS),
      netIncome(usVP1, taxUS),
      netIncome(usVP2, taxUS),
      netIncome(usVP3, taxUS),
      netIncome(usDir, taxUS),
    ];
    
    // Scenario 4: UK Stay
    const ukCF = [
      toUSD_GBP(netIncome(ukAN1, taxUK)),
      toUSD_GBP(netIncome(ukAN2, taxUK)),
      toUSD_GBP(netIncome(ukAN3, taxUK)),
      toUSD_GBP(netIncome(ukAso1, taxUK)),
      toUSD_GBP(netIncome(ukAso2, taxUK)),
      toUSD_GBP(netIncome(ukAso3, taxUK)),
      toUSD_GBP(netIncome(ukVP1, taxUK)),
      toUSD_GBP(netIncome(ukVP2, taxUK)),
      toUSD_GBP(netIncome(ukVP3, taxUK)),
      toUSD_GBP(netIncome(ukDir, taxUK)),
    ];
    
    // NPV calculation
    const npv = (cfs) => cfs.reduce((sum, cf, i) => sum + cf / Math.pow(1 + r, i + 1), 0);
    
    const npvHK = npv(hkCF);
    const npvMBA = npv(mbaCF);
    const npvUSDirect = npv(usDirectCF);
    const npvUK = npv(ukCF);
    
    // Cumulative cash flows
    const cumulative = (cfs) => {
      let cum = 0;
      return cfs.map(cf => { cum += cf; return cum; });
    };
    
    // MBA total cost calculation
    const oppCostY1 = toUSD_GBP(netIncome(ukAN3, taxUK)); // forgone UK AN3 → Aso1 transition
    const oppCostY2 = toUSD_GBP(netIncome(ukAso1, taxUK));
    const totalMBACost = mbaCostY1 + mbaCostY2 + oppCostY1 + oppCostY2 - mbaSigningUSD;
    
    return {
      hkCF, mbaCF, usDirectCF, ukCF,
      npvHK, npvMBA, npvUSDirect, npvUK,
      cumHK: cumulative(hkCF),
      cumMBA: cumulative(mbaCF),
      cumUSDirect: cumulative(usDirectCF),
      cumUK: cumulative(ukCF),
      totalMBACost,
      mbaCashCost: mbaCostY1 + mbaCostY2 - mbaSigningUSD,
      mbaOppCost: oppCostY1 + oppCostY2,
    };
  }, [discountRate, bonusRate, fxGBPUSD, fxGBPHKD, taxUK, taxHK, taxUS,
      ukAN1, ukAN2, ukAN3, ukAso1, ukAso2, ukAso3, ukVP1, ukVP2, ukVP3, ukDir,
      hkAN3, hkAso1, hkAso2, hkAso3, hkVP1, hkVP2, hkVP3, hkDir,
      usAN3, usAso1, usAso2, usAso3, usVP1, usVP2, usVP3, usDir,
      tuitionY1, tuitionY2, livingY1, livingY2, signingBonus]);

  const formatCurrency = (val, decimals = 0) => {
    if (val >= 0) return `$${val.toLocaleString('en-US', { maximumFractionDigits: decimals })}`;
    return `-$${Math.abs(val).toLocaleString('en-US', { maximumFractionDigits: decimals })}`;
  };

  const InputField = ({ label, value, onChange, prefix = '£', unit = 1, suffix = '' }) => {
    const displayValue = value === '' || value === null ? '' : (value / unit);
    const [localValue, setLocalValue] = useState(String(displayValue));
    const inputRef = React.useRef(null);
    
    React.useEffect(() => {
      if (document.activeElement !== inputRef.current) {
        setLocalValue(value === '' || value === null ? '' : String(value / unit));
      }
    }, [value, unit]);
    
    const handleChange = (e) => {
      const raw = e.target.value;
      setLocalValue(raw);
    };
    
    const handleBlur = () => {
      if (localValue === '') {
        onChange('');
        return;
      }
      const parsed = parseFloat(localValue);
      if (!isNaN(parsed)) {
        onChange(parsed * unit);
        setLocalValue(String(parsed));
      } else {
        setLocalValue(value === '' || value === null ? '' : String(value / unit));
      }
    };
    
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-1">{prefix}</span>
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-24 px-2 py-1 text-right text-sm border border-gray-300 rounded"
          />
          <span className="text-sm text-gray-400 ml-1">{suffix}</span>
        </div>
      </div>
    );
  };

  const years = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10'];
  const roles = {
    uk: ['AN1', 'AN2', 'AN3', 'Aso1', 'Aso2', 'Aso3', 'VP1', 'VP2', 'VP3', 'Dir'],
    hk: ['AN1', 'AN2', 'AN3', 'Aso1', 'Aso2', 'Aso3', 'VP1', 'VP2', 'VP3', 'Dir'],
    mba: ['AN1', 'AN2', 'AN3', 'MBA', 'MBA', 'Aso1', 'Aso2', 'Aso3', 'VP1', 'VP2'],
    usDirect: ['AN1', 'AN2', 'AN3', 'Aso1', 'Aso2', 'Aso3', 'VP1', 'VP2', 'VP3', 'Dir'],
  };

  const maxNPV = Math.max(calculations.npvHK, calculations.npvMBA, calculations.npvUSDirect, calculations.npvUK);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">MBA vs. Alternative Paths: NPV Analysis</h1>
        <p className="text-sm text-gray-500 mb-4">10-Year Projection (Jul 2026 – Jul 2036) • All figures in USD</p>
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-200 rounded-lg p-1">
          {['assumptions', 'cashflows', 'summary'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-white text-gray-800 shadow' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'assumptions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Core Assumptions */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">Core Assumptions</h3>
              <InputField label="Discount Rate" value={discountRate} onChange={setDiscountRate} prefix="%" step={0.5} />
              <InputField label="Bonus Rate" value={bonusRate} onChange={setBonusRate} prefix="%" step={5} />
              <InputField label="GBP/USD" value={fxGBPUSD} onChange={setFxGBPUSD} prefix="" step={0.01} />
              <InputField label="GBP/HKD" value={fxGBPHKD} onChange={setFxGBPHKD} prefix="" step={0.1} />
              <div className="mt-3 pt-3 border-t">
                <InputField label="UK Tax Rate" value={taxUK} onChange={setTaxUK} prefix="%" step={1} />
                <InputField label="HK Tax Rate" value={taxHK} onChange={setTaxHK} prefix="%" step={1} />
                <InputField label="US Tax Rate" value={taxUS} onChange={setTaxUS} prefix="%" step={1} />
              </div>
            </div>

            {/* UK Compensation */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">UK Compensation (GBP)</h3>
              <InputField label="Analyst 1" value={ukAN1} onChange={setUkAN1} unit={1000} suffix="k" />
              <InputField label="Analyst 2" value={ukAN2} onChange={setUkAN2} unit={1000} suffix="k" />
              <InputField label="Analyst 3" value={ukAN3} onChange={setUkAN3} unit={1000} suffix="k" />
              <InputField label="Associate 1" value={ukAso1} onChange={setUkAso1} unit={1000} suffix="k" />
              <InputField label="Associate 2" value={ukAso2} onChange={setUkAso2} unit={1000} suffix="k" />
              <InputField label="Associate 3" value={ukAso3} onChange={setUkAso3} unit={1000} suffix="k" />
              <InputField label="VP 1" value={ukVP1} onChange={setUkVP1} unit={1000} suffix="k" />
              <InputField label="VP 2" value={ukVP2} onChange={setUkVP2} unit={1000} suffix="k" />
              <InputField label="VP 3" value={ukVP3} onChange={setUkVP3} unit={1000} suffix="k" />
              <InputField label="Director" value={ukDir} onChange={setUkDir} unit={1000} suffix="k" />
            </div>

            {/* HK Compensation */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">HK Compensation (HKD)</h3>
              <InputField label="Analyst 3" value={hkAN3} onChange={setHkAN3} prefix="HK$" unit={1000} suffix="k" />
              <InputField label="Associate 1" value={hkAso1} onChange={setHkAso1} prefix="HK$" unit={1000} suffix="k" />
              <InputField label="Associate 2" value={hkAso2} onChange={setHkAso2} prefix="HK$" unit={1000} suffix="k" />
              <InputField label="Associate 3" value={hkAso3} onChange={setHkAso3} prefix="HK$" unit={1000} suffix="k" />
              <InputField label="VP 1" value={hkVP1} onChange={setHkVP1} prefix="HK$" unit={1000} suffix="k" />
              <InputField label="VP 2" value={hkVP2} onChange={setHkVP2} prefix="HK$" unit={1000} suffix="k" />
              <InputField label="VP 3" value={hkVP3} onChange={setHkVP3} prefix="HK$" unit={1000} suffix="k" />
              <InputField label="Director" value={hkDir} onChange={setHkDir} prefix="HK$" unit={1000} suffix="k" />
            </div>

            {/* US Compensation */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">US Compensation (USD)</h3>
              <InputField label="Analyst 3" value={usAN3} onChange={setUsAN3} prefix="$" unit={1000} suffix="k" />
              <InputField label="Associate 1" value={usAso1} onChange={setUsAso1} prefix="$" unit={1000} suffix="k" />
              <InputField label="Associate 2" value={usAso2} onChange={setUsAso2} prefix="$" unit={1000} suffix="k" />
              <InputField label="Associate 3" value={usAso3} onChange={setUsAso3} prefix="$" unit={1000} suffix="k" />
              <InputField label="VP 1" value={usVP1} onChange={setUsVP1} prefix="$" unit={1000} suffix="k" />
              <InputField label="VP 2" value={usVP2} onChange={setUsVP2} prefix="$" unit={1000} suffix="k" />
              <InputField label="VP 3" value={usVP3} onChange={setUsVP3} prefix="$" unit={1000} suffix="k" />
              <InputField label="Director" value={usDir} onChange={setUsDir} prefix="$" unit={1000} suffix="k" />
            </div>

            {/* MBA Costs */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">MBA Costs (USD)</h3>
              <InputField label="Tuition Y1" value={tuitionY1} onChange={setTuitionY1} prefix="$" unit={1000} suffix="k" />
              <InputField label="Tuition Y2" value={tuitionY2} onChange={setTuitionY2} prefix="$" unit={1000} suffix="k" />
              <InputField label="Living Y1" value={livingY1} onChange={setLivingY1} prefix="$" unit={1000} suffix="k" />
              <InputField label="Living Y2" value={livingY2} onChange={setLivingY2} prefix="$" unit={1000} suffix="k" />
              <InputField label="Signing Bonus" value={signingBonus} onChange={setSigningBonus} prefix="$" unit={1000} suffix="k" />
              <div className="mt-3 pt-3 border-t text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Cash Cost (net of signing)</span>
                  <span className="font-medium">{formatCurrency(calculations.mbaCashCost)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Opportunity Cost</span>
                  <span className="font-medium">{formatCurrency(calculations.mbaOppCost)}</span>
                </div>
                <div className="flex justify-between text-gray-800 font-semibold mt-1 pt-1 border-t">
                  <span>Total MBA Cost</span>
                  <span>{formatCurrency(calculations.totalMBACost)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cashflows' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Scenario</th>
                    {years.map(y => <th key={y} className="px-3 py-2 text-right">{y}</th>)}
                    <th className="px-3 py-2 text-right font-bold">NPV</th>
                  </tr>
                </thead>
                <tbody>
                  {/* UK Stay */}
                  <tr className="border-t">
                    <td className="px-3 py-2 font-medium text-gray-700">UK Stay</td>
                    {calculations.ukCF.map((cf, i) => (
                      <td key={i} className="px-3 py-2 text-right text-gray-600">{formatCurrency(cf)}</td>
                    ))}
                    <td className="px-3 py-2 text-right font-bold text-gray-800">{formatCurrency(calculations.npvUK)}</td>
                  </tr>
                  <tr className="bg-gray-50 text-xs text-gray-400">
                    <td className="px-3 py-1"></td>
                    {roles.uk.map((r, i) => <td key={i} className="px-3 py-1 text-right">{r}</td>)}
                    <td></td>
                  </tr>
                  
                  {/* HK */}
                  <tr className="border-t">
                    <td className="px-3 py-2 font-medium text-blue-700">UK → HK</td>
                    {calculations.hkCF.map((cf, i) => (
                      <td key={i} className={`px-3 py-2 text-right ${i >= 2 ? 'text-blue-600' : 'text-gray-600'}`}>{formatCurrency(cf)}</td>
                    ))}
                    <td className="px-3 py-2 text-right font-bold text-blue-800">{formatCurrency(calculations.npvHK)}</td>
                  </tr>
                  <tr className="bg-gray-50 text-xs text-gray-400">
                    <td className="px-3 py-1"></td>
                    {roles.hk.map((r, i) => <td key={i} className={`px-3 py-1 text-right ${i >= 2 ? 'text-blue-400' : ''}`}>{i >= 2 ? `HK ${r}` : `UK ${r}`}</td>)}
                    <td></td>
                  </tr>
                  
                  {/* US Direct */}
                  <tr className="border-t">
                    <td className="px-3 py-2 font-medium text-green-700">UK → US (L-1)</td>
                    {calculations.usDirectCF.map((cf, i) => (
                      <td key={i} className={`px-3 py-2 text-right ${i >= 2 ? 'text-green-600' : 'text-gray-600'}`}>{formatCurrency(cf)}</td>
                    ))}
                    <td className="px-3 py-2 text-right font-bold text-green-800">{formatCurrency(calculations.npvUSDirect)}</td>
                  </tr>
                  <tr className="bg-gray-50 text-xs text-gray-400">
                    <td className="px-3 py-1"></td>
                    {roles.usDirect.map((r, i) => <td key={i} className={`px-3 py-1 text-right ${i >= 2 ? 'text-green-400' : ''}`}>{i >= 2 ? `US ${r}` : `UK ${r}`}</td>)}
                    <td></td>
                  </tr>
                  
                  {/* MBA */}
                  <tr className="border-t">
                    <td className="px-3 py-2 font-medium text-purple-700">UK → MBA → US</td>
                    {calculations.mbaCF.map((cf, i) => (
                      <td key={i} className={`px-3 py-2 text-right ${cf < 0 ? 'text-red-600 font-medium' : i >= 5 ? 'text-purple-600' : 'text-gray-600'}`}>
                        {formatCurrency(cf)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-bold text-purple-800">{formatCurrency(calculations.npvMBA)}</td>
                  </tr>
                  <tr className="bg-gray-50 text-xs text-gray-400">
                    <td className="px-3 py-1"></td>
                    {roles.mba.map((r, i) => <td key={i} className={`px-3 py-1 text-right ${i === 3 || i === 4 ? 'text-red-400' : i >= 5 ? 'text-purple-400' : ''}`}>{i >= 5 ? `US ${r}` : i <= 2 ? `UK ${r}` : r}</td>)}
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* NPV Comparison */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-4">10-Year NPV Comparison</h3>
              <div className="space-y-3">
                {[
                  { name: 'UK → HK', npv: calculations.npvHK, color: 'bg-blue-500' },
                  { name: 'UK → US (L-1)', npv: calculations.npvUSDirect, color: 'bg-green-500' },
                  { name: 'UK → MBA → US', npv: calculations.npvMBA, color: 'bg-purple-500' },
                  { name: 'UK Stay', npv: calculations.npvUK, color: 'bg-gray-400' },
                ].sort((a, b) => b.npv - a.npv).map((scenario, i) => (
                  <div key={scenario.name} className="flex items-center">
                    <div className="w-32 text-sm font-medium text-gray-700">{scenario.name}</div>
                    <div className="flex-1 mx-3">
                      <div 
                        className={`h-8 ${scenario.color} rounded flex items-center justify-end pr-2`}
                        style={{ width: `${(scenario.npv / maxNPV) * 100}%` }}
                      >
                        <span className="text-white text-sm font-medium">{formatCurrency(scenario.npv)}</span>
                      </div>
                    </div>
                    {i === 0 && <span className="text-xs text-green-600 font-medium">BEST</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Path Comparison */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-4">Compare Two Paths</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Path 1</label>
                  <select 
                    value={comparePath1} 
                    onChange={(e) => setComparePath1(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option>UK → HK</option>
                    <option>UK → US (L-1)</option>
                    <option>UK → MBA → US</option>
                    <option>UK Stay</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Path 2</label>
                  <select 
                    value={comparePath2} 
                    onChange={(e) => setComparePath2(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option>UK → HK</option>
                    <option>UK → US (L-1)</option>
                    <option>UK → MBA → US</option>
                    <option>UK Stay</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                {(() => {
                  const pathNPVMap = {
                    'UK → HK': calculations.npvHK,
                    'UK → US (L-1)': calculations.npvUSDirect,
                    'UK → MBA → US': calculations.npvMBA,
                    'UK Stay': calculations.npvUK,
                  };
                  const npv1 = pathNPVMap[comparePath1];
                  const npv2 = pathNPVMap[comparePath2];
                  const delta = npv1 - npv2;
                  const isPath1Better = delta > 0;
                  
                  return (
                    <>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium text-gray-700">{comparePath1}</span>
                        <span className="font-bold text-gray-800">{formatCurrency(npv1)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium text-gray-700">{comparePath2}</span>
                        <span className="font-bold text-gray-800">{formatCurrency(npv2)}</span>
                      </div>
                      <div className={`flex items-center justify-between p-4 rounded font-semibold text-white ${isPath1Better ? 'bg-green-600' : 'bg-red-600'}`}>
                        <span>{isPath1Better ? `${comparePath1} is better by` : `${comparePath2} is better by`}</span>
                        <span>{formatCurrency(Math.abs(delta))}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}