"use client"

import { useSyncExternalStore } from "react"

// 로그인 여부(힌트 쿠키) 구독: 네트워크 요청 없이 즉시 판단 → 정적 헤더에서 스켈레톤 없이 버튼 표시
// 쿠키 이름은 lib/auth/session.ts의 SESSION_HINT_COOKIE와 같음 (서버 전용 모듈이라 import하지 않음)
const HINT_COOKIE = "logged_in"
const SESSION_CHANGE_EVENT = "session-change"

function subscribe(onChange: () => void) {
  window.addEventListener(SESSION_CHANGE_EVENT, onChange)
  // 다른 탭에서 로그인/로그아웃한 경우를 위해 탭으로 돌아올 때 다시 확인
  window.addEventListener("focus", onChange)
  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, onChange)
    window.removeEventListener("focus", onChange)
  }
}

const getSnapshot = () => document.cookie.split("; ").includes(`${HINT_COOKIE}=1`)

// 정적 HTML은 비로그인 상태로 생성 (방문자 대부분이 비로그인이라 깜빡임이 가장 적음)
const getServerSnapshot = () => false

export function useLoggedIn() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** 로그인/로그아웃 API 응답으로 쿠키가 바뀐 뒤 호출 → 헤더 즉시 갱신 */
export function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT))
}
