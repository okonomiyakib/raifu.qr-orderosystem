#!/bin/bash
# Supabase 自動停止防止スクリプト
# 毎日実行して無料プランのプロジェクトが停止しないようにする

SUPABASE_URL="https://absxdjytuypbtodgctbc.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFic3hkanl0dXlwYnRvZGdjdGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTQ1MTUsImV4cCI6MjA5MTgzMDUxNX0.WCSH10GfS9L1e8ZrM1HutUnv21_CE3Y-iPsglmJn8kE"
LOG_FILE="/tmp/supabase-ping.log"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "${SUPABASE_URL}/rest/v1/stores?select=id&limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$(date '+%Y-%m-%d %H:%M:%S') ping -> ${STATUS}" >> "$LOG_FILE"
