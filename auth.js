import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

const status = document.querySelector("#auth-status");
const authForms = document.querySelector("#auth-forms");
const accountPanel = document.querySelector("#account-panel");
const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const logoutButton = document.querySelector("#logout-button");
let supabase = null;

function showStatus(text, isError = false) {
  status.textContent = text;
  status.dataset.kind = isError ? "error" : "success";
}

function showSignedOut() {
  authForms.hidden = false;
  accountPanel.hidden = true;
}

function showAccount(user, profile) {
  authForms.hidden = true;
  accountPanel.hidden = false;
  document.querySelector("#account-email").textContent = user.email || "";
  document.querySelector("#account-name").textContent = profile?.full_name || user.user_metadata?.full_name || "Usuário";
  document.querySelector("#account-role").textContent =
    profile?.role === "driver" ? "Perfil: motorista" : "Perfil: cliente";
}

if (!isSupabaseConfigured) {
  showSignedOut();
  showStatus("Cadastro e login preparados, mas ainda precisam ser conectados ao Supabase. Não informe senhas até a configuração ser concluída.", true);
  signupForm.addEventListener("submit", event => {
    event.preventDefault();
    showStatus("Antes de cadastrar, configure a URL e a chave pública do Supabase no arquivo supabase-config.js e execute supabase/schema.sql no projeto Supabase.", true);
  });
  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    showStatus("O login ainda não está conectado. Configure primeiro o Supabase no projeto.", true);
  });
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function refreshSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) showStatus(error.message, true);
    if (!data.session) {
      showSignedOut();
      return;
    }
    const user = data.session.user;
    const { data: profile, error: profileError } = await supabase
      .from("profiles").select("full_name, phone, role").eq("id", user.id).maybeSingle();
    if (profileError) {
      showStatus("Conta conectada, mas não foi possível carregar o perfil. Verifique se o SQL foi executado.", true);
      showSignedOut();
      return;
    }
    showAccount(user, profile);
    showStatus("Você está conectado ao Move Tudo.");
  }

  signupForm.addEventListener("submit", async event => {
    event.preventDefault();
    const data = new FormData(signupForm);
    const fullName = String(data.get("full_name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const role = String(data.get("role") || "client");
    if (password.length < 8) {
      showStatus("Use uma senha com pelo menos 8 caracteres.", true);
      return;
    }
    const button = signupForm.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const { data: result, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, phone, role } }
      });
      if (error) throw error;
      if (result.session) {
        showStatus("Cadastro criado! Sua conta já está conectada.");
        await refreshSession();
      } else {
        showStatus("Cadastro iniciado. Confira seu e-mail para confirmar a conta antes de entrar.");
      }
      signupForm.reset();
    } catch (error) {
      showStatus(error.message || "Não foi possível criar a conta.", true);
    } finally {
      button.disabled = false;
    }
  });

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const button = loginForm.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(data.get("email") || "").trim(),
        password: String(data.get("password") || "")
      });
      if (error) throw error;
      loginForm.reset();
      await refreshSession();
    } catch (error) {
      showStatus(error.message || "Não foi possível entrar.", true);
    } finally {
      button.disabled = false;
    }
  });

  logoutButton.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showStatus(error.message, true);
      return;
    }
    showSignedOut();
    showStatus("Você saiu da sua conta.");
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) showSignedOut();
    else setTimeout(() => refreshSession(), 0);
  });
  refreshSession();
}
