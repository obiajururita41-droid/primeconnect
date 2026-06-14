from pathlib import Path

file = Path("src/pages/Dashboard.tsx")
content = file.read_text()

# 1. Add serviceSettings state after existing useState declarations
old1 = "  const [showBanner, setShowBanner] = useState(true);"
new1 = """  const [showBanner, setShowBanner] = useState(true);
  const [serviceSettings, setServiceSettings] = useState<Record<string, boolean>>({
    airtime_enabled: true,
    data_enabled: true,
    giftcard_enabled: true,
    virtual_sms_enabled: true,
    bulk_sms_enabled: true,
    airtime_to_cash_enabled: true,
    betting_enabled: true,
  });"""

if old1 in content:
    content = content.replace(old1, new1)
    print("Step 1 OK: state added")
else:
    print("Step 1 FAILED")

# 2. Add fetchServiceSettings inside fetchData
old2 = "  async function fetchData() {"
new2 = """  async function fetchData() {
    // Fetch service settings
    const { data: svc } = await supabase
      .from('service_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (svc) setServiceSettings({
      airtime_enabled: svc.airtime_enabled ?? true,
      data_enabled: svc.data_enabled ?? true,
      giftcard_enabled: svc.giftcard_enabled ?? true,
      virtual_sms_enabled: svc.virtual_sms_enabled ?? true,
      bulk_sms_enabled: svc.bulk_sms_enabled ?? true,
      airtime_to_cash_enabled: svc.airtime_to_cash_enabled ?? true,
      betting_enabled: svc.betting_enabled ?? true,
    });"""

if old2 in content:
    content = content.replace(old2, new2)
    print("Step 2 OK: fetch added")
else:
    print("Step 2 FAILED")

# 3. Filter quickActions before render
old3 = "          {quickActions.map((action) => ("
new3 = """          {quickActions.filter(action => {
              if (action.label === 'Airtime')      return serviceSettings.airtime_enabled;
              if (action.label === 'Data')         return serviceSettings.data_enabled;
              if (action.label === 'Gift Cards')   return serviceSettings.giftcard_enabled;
              if (action.label === 'Virtual SMS')  return serviceSettings.virtual_sms_enabled;
              if (action.label === 'Bulk SMS')     return serviceSettings.bulk_sms_enabled;
              if (action.label === 'Airtime 2 Cash') return serviceSettings.airtime_to_cash_enabled;
              if (action.label === 'Bet Funding')  return serviceSettings.betting_enabled;
              return true;
            }).map((action) => ("""

if old3 in content:
    content = content.replace(old3, new3)
    print("Step 3 OK: filter added")
else:
    print("Step 3 FAILED")

file.write_text(content)
print("Done!")
