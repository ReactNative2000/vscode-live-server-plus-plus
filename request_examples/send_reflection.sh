#!/usr/bin/env bash
# Send reflection JSON payload via curl (for testing)
ENDPOINT="https://script.google.com/macros/s/AKfycbwELGti1O-UzG5fhGf0IYJY-wZ1wzYmxGO4aGgi9WpzwO0Wr_SjGIc-68MHY72kUmJ7rA/exec"
json='{\
  "fio":"Test Student",\
  "topic":"Algorithms",\
  "game":"Tic-Tac-Toe",\
  "q1":"The explanation of recursion was clear",\
  "q2":"I got stuck at base cases",\
  "q3":"4",\
  "q4":"😊",\
  "q5":["More examples","Slower pace"],\
  "ts":"2025-10-17T12:00:00Z",\
  "source":"curl-test"\
}'

curl -i -X POST -H "Content-Type: application/json" -d "$json" "$ENDPOINT"
