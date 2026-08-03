import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  getPackages, updatePackage,
  getPricingRules, updatePricingRule, deletePricingRule, createPricingRule,
  getCoverageRows, updateCoverageRow, deleteCoverageRow, createCoverageRow,
  getSettings, updateSettings,
  type Package, type PricingRule, type CoverageRow, type SiteSettings,
} from '../../api/admin';

// ─── Auth guard ────────────────────────────────────────────────────
function useAdminAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem('pg_admin_token')) navigate('/admin/login');
  }, [navigate]);
}

// ─── Shared badge ──────────────────────────────────────────────────
function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-inter text-[11px] font-semibold ${
      active ? 'bg-[#168A5A]/15 text-[#168A5A]' : 'bg-gray-100 text-gray-400'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

// ─── Packages Tab ─────────────────────────────────────────────────
function PackagesTab() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<{ id: string; prices: Record<string, number> } | null>(null);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setPackages(await getPackages()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function savePackage() {
    if (!editing) return;
    setSaving(true);
    try {
      await updatePackage(editing.id, { prices: editing.prices });
      await load();
      setEditing(null);
      showToast('Prices updated');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error');
    } finally { setSaving(false); }
  }

  async function toggleActive(pkg: Package) {
    try {
      await updatePackage(pkg.id, { is_active: !pkg.is_active });
      await load();
      showToast(`Package ${pkg.is_active ? 'deactivated' : 'activated'}`);
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Error'); }
  }

  const TERMS = ['1m', '3m', '6m', '12m'];
  const TERM_LABELS: Record<string, string> = { '1m': '1 Month', '3m': '3 Months', '6m': '6 Months', '12m': '12 Months' };

  if (loading) return <div className="text-[#5F6368] font-inter text-[14px] py-12 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 bg-[#168A5A] text-white font-inter text-[14px] font-medium px-5 py-3 rounded-[10px] shadow-lg z-50 transition-all">
          {toast}
        </div>
      )}

      {packages.map((pkg) => (
        <div key={pkg.id} className="bg-white border border-[#E6E8EB] rounded-[16px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E8EB] bg-[#F7F7F5]">
            <div className="flex items-center gap-3">
              <span className="font-satoshi font-semibold text-[#111] text-[18px]">{pkg.name}</span>
              <ActiveBadge active={pkg.is_active} />
              <span className="font-inter text-[12px] text-[#9AA0A6]">slug: {pkg.slug}</span>
            </div>
            <div className="flex items-center gap-2">
              {editing?.id === pkg.id ? (
                <>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 font-inter text-[13px] font-medium text-[#5F6368] hover:text-[#111] transition-colors">Cancel</button>
                  <button onClick={savePackage} disabled={saving} className="px-4 py-2 bg-[#168A5A] text-white font-inter text-[13px] font-semibold rounded-[8px] hover:bg-[#1a9e67] disabled:opacity-50 transition-colors">
                    {saving ? 'Saving…' : 'Save Prices'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing({ id: pkg.id, prices: { ...pkg.prices } })}
                    className="px-4 py-2 border border-[#E6E8EB] font-inter text-[13px] font-medium text-[#111] rounded-[8px] hover:border-[#168A5A] hover:text-[#168A5A] transition-colors"
                  >
                    Edit Prices
                  </button>
                  <button
                    onClick={() => toggleActive(pkg)}
                    className={`px-4 py-2 font-inter text-[13px] font-medium rounded-[8px] border transition-colors ${
                      pkg.is_active
                        ? 'border-red-200 text-red-500 hover:bg-red-50'
                        : 'border-green-200 text-[#168A5A] hover:bg-green-50'
                    }`}
                  >
                    {pkg.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Price grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-[#E6E8EB]">
            {TERMS.map((term) => (
              <div key={term} className="px-6 py-5">
                <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#9AA0A6] mb-2">{TERM_LABELS[term]}</p>
                {editing?.id === pkg.id ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-inter text-[14px] text-[#9AA0A6]">$</span>
                    <input
                      type="number"
                      value={editing.prices[term] ?? ''}
                      onChange={(e) => setEditing({ ...editing, prices: { ...editing.prices, [term]: parseFloat(e.target.value) } })}
                      className="w-full pl-7 pr-3 py-2 border border-[#E6E8EB] rounded-[8px] font-inter text-[15px] font-semibold text-[#111] outline-none focus:border-[#168A5A] focus:ring-1 focus:ring-[#168A5A]/20"
                    />
                  </div>
                ) : (
                  <p className="font-satoshi font-semibold text-[#111] text-[22px]">
                    ${pkg.prices[term]?.toLocaleString() ?? '—'}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="px-6 py-4 border-t border-[#E6E8EB]">
            <p className="font-inter text-[13px] text-[#5F6368]">{pkg.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pricing Rules Tab ────────────────────────────────────────────
function PricingRulesTab() {
  const [rules, setRules]         = useState<PricingRule[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<Partial<PricingRule>>({});
  const [showNew, setShowNew]     = useState(false);
  const [newForm, setNewForm]     = useState<Partial<PricingRule>>({
    rule_type: 'multiplier', context: 'deductible', is_active: true, match_value: null,
  });
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setRules(await getPricingRules()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      await updatePricingRule(id, editForm);
      await load(); setEditingId(null);
      showToast('Rule updated');
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function deleteRule(id: string) {
    if (!confirm('Delete this pricing rule?')) return;
    try { await deletePricingRule(id); await load(); showToast('Rule deleted'); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Error'); }
  }

  async function createRule() {
    setSaving(true);
    try {
      await createPricingRule(newForm);
      await load(); setShowNew(false);
      setNewForm({ rule_type: 'multiplier', context: 'deductible', is_active: true, match_value: null });
      showToast('Rule created');
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  const contextColors: Record<string, string> = {
    deductible:    'bg-blue-50 text-blue-600',
    license:       'bg-purple-50 text-purple-600',
    age:           'bg-orange-50 text-orange-600',
    multi_vehicle: 'bg-teal-50 text-teal-600',
    term:          'bg-green-50 text-green-600',
  };

  if (loading) return <div className="text-[#5F6368] font-inter text-[14px] py-12 text-center">Loading…</div>;

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-6 right-6 bg-[#168A5A] text-white font-inter text-[14px] font-medium px-5 py-3 rounded-[10px] shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-[#168A5A] text-white font-inter text-[13px] font-semibold rounded-[8px] hover:bg-[#1a9e67] transition-colors"
        >
          + Add Rule
        </button>
      </div>

      {/* New rule form */}
      {showNew && (
        <div className="bg-white border-2 border-[#168A5A] rounded-[12px] p-5 space-y-4">
          <p className="font-inter font-semibold text-[14px] text-[#111]">New Pricing Rule</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { key: 'rule_key', label: 'Rule Key', type: 'text' },
              { key: 'label', label: 'Label', type: 'text' },
              { key: 'multiplier', label: 'Multiplier', type: 'number' },
              { key: 'match_value', label: 'Match Value', type: 'text' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1 uppercase tracking-wide">{label}</label>
                <input
                  type={type}
                  step={type === 'number' ? '0.01' : undefined}
                  value={(newForm as Record<string, unknown>)[key] as string ?? ''}
                  onChange={(e) => setNewForm({ ...newForm, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                  className="w-full px-3 py-2 border border-[#E6E8EB] rounded-[8px] font-inter text-[13px] outline-none focus:border-[#168A5A]"
                />
              </div>
            ))}
            <div>
              <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1 uppercase tracking-wide">Context</label>
              <select
                value={newForm.context ?? 'deductible'}
                onChange={(e) => setNewForm({ ...newForm, context: e.target.value as PricingRule['context'] })}
                className="w-full px-3 py-2 border border-[#E6E8EB] rounded-[8px] font-inter text-[13px] outline-none focus:border-[#168A5A] bg-white"
              >
                {['deductible','license','age','multi_vehicle','term'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1 uppercase tracking-wide">Type</label>
              <select
                value={newForm.rule_type ?? 'multiplier'}
                onChange={(e) => setNewForm({ ...newForm, rule_type: e.target.value as PricingRule['rule_type'] })}
                className="w-full px-3 py-2 border border-[#E6E8EB] rounded-[8px] font-inter text-[13px] outline-none focus:border-[#168A5A] bg-white"
              >
                <option value="multiplier">multiplier</option>
                <option value="term_discount">term_discount</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 font-inter text-[13px] text-[#5F6368] hover:text-[#111]">Cancel</button>
            <button onClick={createRule} disabled={saving} className="px-4 py-2 bg-[#168A5A] text-white font-inter text-[13px] font-semibold rounded-[8px] disabled:opacity-50">
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Rules table */}
      <div className="bg-white border border-[#E6E8EB] rounded-[12px] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-[#E6E8EB]">
              {['Context','Rule Key','Label','Match','Multiplier','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 font-inter text-[11px] uppercase tracking-[0.08em] text-[#9AA0A6] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-[#FAFAFA] transition-colors">
                {editingId === rule.id ? (
                  <>
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { key: 'label', label: 'Label', type: 'text' },
                          { key: 'multiplier', label: 'Multiplier', type: 'number' },
                          { key: 'match_value', label: 'Match Value', type: 'text' },
                        ].map(({ key, label, type }) => (
                          <div key={key}>
                            <label className="block font-inter text-[10px] text-[#9AA0A6] mb-1 uppercase">{label}</label>
                            <input
                              type={type}
                              step={type === 'number' ? '0.01' : undefined}
                              value={(editForm as Record<string, unknown>)[key] as string ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                              className="w-full px-2 py-1.5 border border-[#E6E8EB] rounded-[6px] font-inter text-[13px] outline-none focus:border-[#168A5A]"
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block font-inter text-[10px] text-[#9AA0A6] mb-1 uppercase">Active</label>
                          <select
                            value={editForm.is_active ? 'true' : 'false'}
                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                            className="w-full px-2 py-1.5 border border-[#E6E8EB] rounded-[6px] font-inter text-[13px] outline-none focus:border-[#168A5A] bg-white"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" colSpan={2}>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(rule.id)} disabled={saving} className="px-3 py-1.5 bg-[#168A5A] text-white font-inter text-[12px] font-semibold rounded-[6px] disabled:opacity-50">
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-[#E6E8EB] font-inter text-[12px] text-[#5F6368] rounded-[6px]">Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <span className={`font-inter text-[12px] font-medium px-2 py-0.5 rounded-[4px] ${contextColors[rule.context] ?? 'bg-gray-50 text-gray-500'}`}>
                        {rule.context}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-inter text-[13px] text-[#5F6368] font-mono">{rule.rule_key}</td>
                    <td className="px-4 py-3 font-inter text-[13px] text-[#111] font-medium">{rule.label}</td>
                    <td className="px-4 py-3 font-inter text-[13px] text-[#5F6368]">{rule.match_value ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-satoshi font-semibold text-[15px] ${rule.multiplier < 1 ? 'text-[#168A5A]' : rule.multiplier > 1 ? 'text-orange-500' : 'text-[#111]'}`}>
                        {rule.multiplier < 1 ? `−${Math.round((1 - rule.multiplier) * 100)}%` : rule.multiplier > 1 ? `+${Math.round((rule.multiplier - 1) * 100)}%` : '×1'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><ActiveBadge active={rule.is_active} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingId(rule.id); setEditForm({ label: rule.label, multiplier: rule.multiplier, match_value: rule.match_value, is_active: rule.is_active }); }}
                          className="font-inter text-[12px] text-[#168A5A] hover:underline"
                        >Edit</button>
                        <button onClick={() => deleteRule(rule.id)} className="font-inter text-[12px] text-red-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Coverage Rows Tab ────────────────────────────────────────────
function CoverageRowsTab() {
  const [rows, setRows]           = useState<CoverageRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<Partial<CoverageRow>>({});
  const [showNew, setShowNew]     = useState(false);
  const [newForm, setNewForm]     = useState<Partial<CoverageRow>>({ sort_order: 0, is_active: true });
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await getCoverageRows()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function saveEdit(id: string) {
    setSaving(true);
    try { await updateCoverageRow(id, editForm); await load(); setEditingId(null); showToast('Row updated'); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function deleteRow(id: string) {
    if (!confirm('Deactivate this coverage row?')) return;
    try { await deleteCoverageRow(id); await load(); showToast('Row deactivated'); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Error'); }
  }

  async function createRow() {
    setSaving(true);
    try { await createCoverageRow(newForm); await load(); setShowNew(false); setNewForm({ sort_order: 0, is_active: true }); showToast('Row created'); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="text-[#5F6368] font-inter text-[14px] py-12 text-center">Loading…</div>;

  const FIELDS: { key: keyof CoverageRow; label: string; wide?: boolean }[] = [
    { key: 'sort_order', label: 'Order' },
    { key: 'name', label: 'Coverage Name', wide: true },
    { key: 'description', label: 'Description', wide: true },
    { key: 'basic_value', label: 'Basic', wide: true },
    { key: 'full_value', label: 'Full', wide: true },
  ];

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-6 right-6 bg-[#168A5A] text-white font-inter text-[14px] font-medium px-5 py-3 rounded-[10px] shadow-lg z-50">{toast}</div>
      )}

      <div className="flex justify-end">
        <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-[#168A5A] text-white font-inter text-[13px] font-semibold rounded-[8px] hover:bg-[#1a9e67] transition-colors">
          + Add Row
        </button>
      </div>

      {showNew && (
        <div className="bg-white border-2 border-[#168A5A] rounded-[12px] p-5 space-y-4">
          <p className="font-inter font-semibold text-[14px] text-[#111]">New Coverage Row</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className={key === 'description' || key === 'name' ? 'sm:col-span-3' : ''}>
                <label className="block font-inter text-[11px] font-medium text-[#5F6368] mb-1 uppercase tracking-wide">{label}</label>
                <input
                  type={key === 'sort_order' ? 'number' : 'text'}
                  value={(newForm as Record<string, unknown>)[key] as string ?? ''}
                  onChange={(e) => setNewForm({ ...newForm, [key]: key === 'sort_order' ? parseInt(e.target.value) : e.target.value })}
                  className="w-full px-3 py-2 border border-[#E6E8EB] rounded-[8px] font-inter text-[13px] outline-none focus:border-[#168A5A]"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 font-inter text-[13px] text-[#5F6368]">Cancel</button>
            <button onClick={createRow} disabled={saving} className="px-4 py-2 bg-[#168A5A] text-white font-inter text-[13px] font-semibold rounded-[8px] disabled:opacity-50">
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E6E8EB] rounded-[12px] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-[#E6E8EB]">
              {['#','Coverage','Description','Basic','Full','Status','Actions'].map(h => (
                <th key={h} className="px-4 py-3 font-inter text-[11px] uppercase tracking-[0.08em] text-[#9AA0A6] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-[#FAFAFA] transition-colors">
                {editingId === row.id ? (
                  <>
                    <td className="px-4 py-3" colSpan={5}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {FIELDS.map(({ key, label }) => (
                          <div key={key} className={key === 'description' || key === 'name' ? 'sm:col-span-3' : ''}>
                            <label className="block font-inter text-[10px] text-[#9AA0A6] mb-1 uppercase">{label}</label>
                            <input
                              type={key === 'sort_order' ? 'number' : 'text'}
                              value={(editForm as Record<string, unknown>)[key] as string ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, [key]: key === 'sort_order' ? parseInt(e.target.value) : e.target.value })}
                              className="w-full px-2 py-1.5 border border-[#E6E8EB] rounded-[6px] font-inter text-[13px] outline-none focus:border-[#168A5A]"
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3" colSpan={2}>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(row.id)} disabled={saving} className="px-3 py-1.5 bg-[#168A5A] text-white font-inter text-[12px] font-semibold rounded-[6px] disabled:opacity-50">
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-[#E6E8EB] font-inter text-[12px] text-[#5F6368] rounded-[6px]">Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-inter text-[13px] text-[#9AA0A6] font-medium">{row.sort_order}</td>
                    <td className="px-4 py-3 font-inter text-[13px] text-[#111] font-medium max-w-[180px]">{row.name}</td>
                    <td className="px-4 py-3 font-inter text-[12px] text-[#5F6368] max-w-[200px]">{row.description}</td>
                    <td className="px-4 py-3 font-inter text-[12px] text-[#5F6368]">{row.basic_value}</td>
                    <td className="px-4 py-3 font-inter text-[12px] text-[#5F6368]">{row.full_value}</td>
                    <td className="px-4 py-3"><ActiveBadge active={row.is_active} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingId(row.id); setEditForm({ sort_order: row.sort_order, name: row.name, description: row.description, basic_value: row.basic_value, full_value: row.full_value, is_active: row.is_active }); }}
                          className="font-inter text-[12px] text-[#168A5A] hover:underline"
                        >Edit</button>
                        <button onClick={() => deleteRow(row.id)} className="font-inter text-[12px] text-red-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────
function SettingsTab() {
  const [form, setForm]     = useState<SiteSettings>({ company_name: '', etransfer_email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  useEffect(() => {
    getSettings()
      .then(s => setForm(s))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await updateSettings(form);
      showToast('Settings saved');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-[#5F6368] font-inter text-[14px] py-12 text-center">Loading…</div>;

  return (
    <div className="max-w-[600px] space-y-4">
      {toast && (
        <div className="fixed top-6 right-6 bg-[#168A5A] text-white font-inter text-[14px] font-medium px-5 py-3 rounded-[10px] shadow-lg z-50">{toast}</div>
      )}

      <div className="bg-white border border-[#E6E8EB] rounded-[12px] p-6 space-y-5">
        <p className="font-inter font-semibold text-[15px] text-[#111]">e-Transfer Recipient</p>
        <p className="font-inter text-[13px] text-[#5F6368]">These values appear on the payment step shown to customers.</p>

        <div>
          <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F6368] mb-2">
            Company / Recipient Name
          </label>
          <input
            type="text"
            value={form.company_name}
            onChange={e => setForm({ ...form, company_name: e.target.value })}
            className="w-full px-4 py-3 border border-[#E6E8EB] rounded-[10px] font-inter text-[14px] outline-none focus:border-[#168A5A] transition-colors bg-[#FAFAFA] focus:bg-white"
            placeholder="PolarCover ENTERPRISES LLC"
          />
          <p className="font-inter text-[12px] text-[#9AA0A6] mt-1.5">Displayed in the "E-Transfer to" card and the recipient name copy field.</p>
        </div>

        <div>
          <label className="block font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F6368] mb-2">
            e-Transfer Email Address
          </label>
          <input
            type="email"
            value={form.etransfer_email}
            onChange={e => setForm({ ...form, etransfer_email: e.target.value })}
            className="w-full px-4 py-3 border border-[#E6E8EB] rounded-[10px] font-inter text-[14px] outline-none focus:border-[#168A5A] transition-colors bg-[#FAFAFA] focus:bg-white"
            placeholder="polarguardfinance@hotmail.com"
          />
          <p className="font-inter text-[12px] text-[#9AA0A6] mt-1.5">Customers copy this address when sending their payment.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={save}
            disabled={saving || !form.company_name || !form.etransfer_email}
            className="px-6 py-2.5 bg-[#168A5A] text-white font-inter text-[14px] font-semibold rounded-[10px] hover:bg-[#1a9e67] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Shell ──────────────────────────────────────────────
const TABS = [
  { id: 'packages',  label: 'Packages & Prices' },
  { id: 'pricing',   label: 'Pricing Rules' },
  { id: 'coverage',  label: 'Coverage Rows' },
  { id: 'settings',  label: 'Settings' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function AdminDashboard() {
  useAdminAuth();
  const [tab, setTab] = useState<TabId>('packages');
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('pg_admin_token');
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Top nav */}
      <header className="bg-white border-b border-[#E6E8EB] px-6 py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#168A5A] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="font-satoshi font-semibold text-[#111] text-[16px]">PolarGuard Admin</span>
            <span className="font-inter text-[12px] text-white bg-[#168A5A] px-2 py-0.5 rounded-full">Dashboard</span>
          </div>
          <button onClick={logout} className="font-inter text-[13px] text-[#5F6368] hover:text-[#111] transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-[#E6E8EB] rounded-[12px] p-1 mb-8 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-[8px] font-inter text-[14px] font-medium transition-all ${
                tab === t.id
                  ? 'bg-[#111] text-white shadow-sm'
                  : 'text-[#5F6368] hover:text-[#111]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'packages'  && <PackagesTab />}
        {tab === 'pricing'   && <PricingRulesTab />}
        {tab === 'coverage'  && <CoverageRowsTab />}
        {tab === 'settings'  && <SettingsTab />}
      </div>
    </div>
  );
}
