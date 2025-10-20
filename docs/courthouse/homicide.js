document.addEventListener('DOMContentLoaded', () => {
  const baseInput = document.getElementById('api-base')
  const loadBtn = document.getElementById('load')
  const clearBtn = document.getElementById('clear')
  const status = document.getElementById('status')
  const list = document.getElementById('items')

  function setStatus(msg) {
    status.textContent = msg
  }

  loadBtn.addEventListener('click', async () => {
    const base = baseInput.value || 'http://localhost:5002'
    setStatus('Loading cases...')
    try {
      const res = await fetch(base + '/api/cases')
      if (!res.ok) throw new Error('Network error: ' + res.status)
      const data = await res.json()
      list.innerHTML = ''
      if (!Array.isArray(data) || data.length === 0) {
        setStatus('No cases returned')
        return
      }
      data.slice(0, 50).forEach(item => {
        const li = document.createElement('li')
        // Try a few common field names and fallback to JSON string
        const id = item.id || item.case_id || item.caseNumber || item.caseNo || item.reference || 'n/a'
        const title = item.title || item.name || item.summary || item.description || JSON.stringify(item)
        li.textContent = `${id} — ${title}`
        list.appendChild(li)
      })
      setStatus('Loaded ' + data.length + ' cases')
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
  })

  clearBtn.addEventListener('click', () => {
    list.innerHTML = ''
    setStatus('Cleared')
  })
})
