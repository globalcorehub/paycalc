/* Sources: IRS Revenue Procedure 2025-32; IRS Publication 15 (2026).
 * Simplified estimates: standard deductions, ordinary income, no tax credits.
 */
(() => {
  const caps = {
    single: [12400, 50400, 105700, 201775, 256225, 640600],
    married: [24800, 100800, 211400, 403550, 512450, 768700],
    hoh: [17700, 67450, 105700, 201750, 256200, 640600]
  };
  const rates = [.10, .12, .22, .24, .32, .35, .37];
  const standard = { single: 16100, married: 32200, hoh: 24150 };
  function incomeTax(taxable, status) {
    if (!Number.isFinite(taxable) || taxable < 0 || !Object.hasOwn(caps, status)) return NaN;
    let tax = 0, previous = 0;
    [...caps[status], Infinity].forEach((cap, index) => {
      tax += Math.max(0, Math.min(taxable, cap) - previous) * rates[index];
      previous = cap;
    });
    return tax;
  }
  window.PayCalc2026 = { incomeTax, standard, socialSecurityWageBase: 184500 };
  const tool = document.querySelector('[data-paycalc]');
  if (!tool) return;
  const inputs = [...tool.querySelectorAll('input')];
  const statusInput = tool.querySelector('select');
  const outputs = [...tool.querySelectorAll('output')];
  const amount = value => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function calculate() {
    const values = inputs.map(input => input.value.trim() === '' ? NaN : Number(input.value));
    const status = statusInput?.value || 'single';
    inputs.forEach((input, index) => input.setAttribute('aria-invalid', String(!Number.isFinite(values[index]) || values[index] < 0)));
    if (!values.every(value => Number.isFinite(value) && value >= 0)) { outputs.forEach(el => { el.textContent = '-'; }); return; }
    let results;
    if (tool.dataset.paycalc === 'bracket') {
      const [income] = values;
      const tax = incomeTax(income, status);
      const index = caps[status].findIndex(cap => income <= cap);
      results = [amount(tax), (rates[index < 0 ? 6 : index] * 100).toFixed(0) + '%', (income ? tax / income * 100 : 0).toFixed(2) + '%'];
    } else if (tool.dataset.paycalc === 'self-employment') {
      const [profit, ssWages, medicareWages] = values;
      const earnings = profit * .9235;
      if (earnings < 400) { outputs.forEach(el => { el.textContent = amount(0); }); return; }
      const social = Math.min(earnings, Math.max(0, 184500 - ssWages)) * .124;
      const regularMedicare = earnings * .029;
      const threshold = status === 'married' ? 250000 : 200000;
      const additionalMedicare = Math.max(0, earnings - Math.max(0, threshold - medicareWages)) * .009;
      const total = social + regularMedicare + additionalMedicare;
      results = [amount(social), amount(regularMedicare + additionalMedicare), amount(total), amount((social + regularMedicare) / 2)];
    } else {
      const [salary, contribution, limit, matchRate, matchCap] = values;
      if (contribution > 100 || matchCap > 100) { outputs.forEach(el => { el.textContent = '-'; }); return; }
      const employee = Math.min(salary * contribution / 100, limit);
      // Match is based on actual employee deferrals, after the supplied plan limit.
      const employer = Math.min(employee, salary * matchCap / 100) * matchRate / 100;
      results = [amount(employee), amount(employer), amount(employee + employer)];
    }
    outputs.forEach((output, index) => { output.textContent = results[index]; });
  }
  inputs.forEach(input => input.addEventListener('input', calculate));
  statusInput?.addEventListener('change', calculate);
  calculate();
})();
