// Apps Script Web App to accept form responses (JSON or form-encoded) and reconciliation POSTs.
// Deploy as a Web App (New deployment → Web app). Set 'Execute as: Me' and 'Who has access: Anyone'.

const SPREADSHEET_ID = 'PUT_YOUR_SPREADSHEET_ID_HERE'; // <-- set this

function doPost(e){
  try{
    const contentType = (e.postData && e.postData.type) || '';
    const raw = (e.postData && e.postData.contents) || '';
    let payload = {};

    if(contentType.indexOf('application/json') !== -1){
      payload = JSON.parse(raw);
    } else {
      // form-encoded: use e.parameter / e.parameters
      payload = {};
      for(const k in e.parameter) payload[k] = e.parameter[k];
      if(e.parameters && e.parameters.q5) payload.q5 = e.parameters.q5;
    }

    // Decide target sheet based on payload type
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if(payload && payload._type === 'reconciliation'){
      const sheet = ss.getSheetByName('Reconciliation') || ss.insertSheet('Reconciliation');
      sheet.appendRow([new Date(), payload.fio||'', payload.topic||'', payload.amount||'', payload.tx||'', payload.who||'']);
    } else {
      const sheet = ss.getSheetByName('Responses') || ss.insertSheet('Responses');
      sheet.appendRow([new Date(), payload.fio||'', payload.topic||'', payload.q1||'', payload.q2||'', payload.q3||'', payload.q4||'', Array.isArray(payload.q5) ? payload.q5.join('; ') : (payload.q5||'')]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch(err){
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
