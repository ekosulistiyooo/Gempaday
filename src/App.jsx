import { useEffect, useMemo, useState } from 'react'

const BMKG_API_URL = 'https://data.bmkg.go.id/DataMKG/lastgempadirasakan.json'

const normalizeEarthquakes = (payload) => {
  const rawData = payload?.Infogempa?.gempa ?? payload?.gempa ?? payload?.data ?? []

  if (!Array.isArray(rawData)) {
    return []
  }

  return rawData.map((item, index) => ({
    id: item?.Tanggal ?? item?.Date ?? `${index}-${item?.Wilayah ?? 'gempa'}`,
    date: item?.Tanggal ?? item?.Date ?? 'Tidak diketahui',
    time: item?.Jam ?? item?.Time ?? 'Tidak diketahui',
    magnitude: Number(item?.Magnitude ?? item?.Mag ?? 0) || 0,
    depth: item?.Kedalaman ?? item?.Depth ?? 'Tidak diketahui',
    location: item?.Wilayah ?? item?.Area ?? 'Tidak diketahui',
    felt: item?.Dirasakan ?? item?.Felt ?? null,
    latitude: item?.Lintang ?? item?.Latitude ?? null,
    longitude: item?.Bujur ?? item?.Longitude ?? null,
  }))
}

function App() {
  const [earthquakes, setEarthquakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(BMKG_API_URL)

        if (!response.ok) {
          throw new Error('Gagal mengambil data dari BMKG')
        }

        const data = await response.json()
        const normalized = normalizeEarthquakes(data)
        setEarthquakes(normalized)
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data.')
      } finally {
        setLoading(false)
      }
    }

    fetchEarthquakes()
  }, [])

  const latestEarthquake = earthquakes[0]
  const strongestEarthquake = useMemo(() => {
    if (!earthquakes.length) return null

    return earthquakes.reduce((max, item) =>
      Number(item.magnitude) > Number(max.magnitude) ? item : max,
    )
  }, [earthquakes])

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">BMKG Monitoring</p>
          <h1>Gempaday</h1>
        </div>
        <span className="live-badge">Live Data</span>
      </header>

      <main className="content">
        <section className="hero">
          <div>
            <p className="section-label">Informasi terbaru</p>
            <h2>Data gempa bumi Indonesia</h2>
          </div>
          <button className="refresh-button" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </section>

        {loading && (
          <div className="status-box loading">
            <p>Memuat data gempa...</p>
          </div>
        )}

        {error && !loading && (
          <div className="status-box error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && earthquakes.length > 0 && (
          <>
            <section className="stats-grid">
              <article className="stat-card accent">
                <span>Gempa terbaru</span>
                <strong>{latestEarthquake?.magnitude || 0} M</strong>
                <small>{latestEarthquake?.location || '-'}</small>
              </article>

              <article className="stat-card">
                <span>Magnitude terbesar</span>
                <strong>{strongestEarthquake?.magnitude || 0} M</strong>
                <small>{strongestEarthquake?.location || '-'}</small>
              </article>

              <article className="stat-card">
                <span>Jumlah data</span>
                <strong>{earthquakes.length}</strong>
                <small>kejadian terpantau</small>
              </article>
            </section>

            <section className="table-card">
              <div className="table-header">
                <h3>Daftar Gempa</h3>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Lokasi</th>
                      <th>Magnitudo</th>
                      <th>Kedalaman</th>
                      <th>Dirasakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earthquakes.map((quake) => (
                      <tr key={quake.id}>
                        <td>
                          <div className="date-block">
                            <strong>{quake.date}</strong>
                            <span>{quake.time}</span>
                          </div>
                        </td>
                        <td>{quake.location}</td>
                        <td>
                          <span className={`magnitude ${quake.magnitude >= 5 ? 'danger' : quake.magnitude >= 3 ? 'warning' : 'safe'}`}>
                            {quake.magnitude.toFixed(1)} M
                          </span>
                        </td>
                        <td>{quake.depth}</td>
                        <td>{quake.felt || 'Tidak ada laporan'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {!loading && !error && earthquakes.length === 0 && (
          <div className="status-box empty">
            <p>Belum ada data gempa yang tersedia saat ini.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
