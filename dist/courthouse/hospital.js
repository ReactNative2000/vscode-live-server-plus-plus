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
    const base = baseInput.value || 'http://localhost:4001'
    setStatus('Loading items...')
    try {
      const res = await fetch(base + '/api/items')
      if (!res.ok) throw new Error('Network error: ' + res.status)
      const data = await res.json()
      list.innerHTML = ''
      if (!Array.isArray(data) || data.length === 0) {
        setStatus('No items returned')
        return
      }
      data.slice(0, 50).forEach(item => {
        const li = document.createElement('li')
        li.textContent = `${item.sku} — ${item.name} (${item.qty || item.quantity || 'n/a'})`
        list.appendChild(li)
      })
      setStatus('Loaded ' + data.length + ' items')
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
  })

  clearBtn.addEventListener('click', () => {
    list.innerHTML = ''
    setStatus('Cleared')
  })
})
