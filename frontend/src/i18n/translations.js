export const translations = {
  pl: {
    // Brand & Header
    brand_subtitle: "System zarządzania finansami osobistymi",
    server_online: "Serwer online",
    server_offline: "Serwer offline 🔴",
    logout: "Wyloguj się",
    
    // Auth Modal
    auth_title: "LifeTrack",
    auth_subtitle: "System ewidencji finansów osobistych",
    tab_login: "Logowanie",
    tab_register: "Rejestracja",
    your_name: "Twoje imię",
    name_placeholder: "np. Jan",
    main_currency: "Główna waluta",
    email: "Adres e-mail",
    password: "Hasło",
    btn_login: "Zaloguj się do konta",
    btn_register: "Zarejestruj się",
    demo_login: "⚡ Szybki start (Konto demonstracyjne)",
    loading: "Ładowanie...",
    auth_error: "Błąd uwierzytelniania",
    demo_error: "Nie udało się zalogować na konto demo",
    gdpr_label_prefix: "Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z ",
    gdpr_link: "Klauzulą informacyjną RODO",
    gdpr_required_error: "Musisz zaakceptować zgodę RODO, aby utworzyć konto.",
    gdpr_modal_title: "🔒 Klauzula informacyjna RODO (GDPR)",
    gdpr_modal_text: "Zgodnie z art. 13 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO) informujemy, że:\n\n1. Administratorem Twoich danych osobowych jest system LifeTrack.\n2. Przetwarzamy dane podane podczas rejestracji (adres e-mail, imię, preferowana waluta oraz historia operacji finansowych) wyłącznie w celu świadczenia usługi prowadzenia budżetu osobistego.\n3. Podstawą prawną przetwarzania jest Twoja dobrowolna zgoda (art. 6 ust. 1 lit. a RODO) oraz realizacja usługi (art. 6 ust. 1 lit. b RODO).\n4. Twoje dane są bezpiecznie przechowywane w bazie danych (hasła są szyfrowane algorytmem bcrypt) i nie są przekazywane podmiotom trzecim.\n5. Masz prawo dostępu do swoich danych, ich sprostowania, eksportu (CSV) oraz całkowitego usunięcia konta.",
    gdpr_close: "Rozumiem i zamykam",

    // Period Filter & Export
    period_this_month: "Ten miesiąc",
    period_this_week: "Ten tydzień",
    period_single_day: "Dzień",
    period_custom_range: "Własny okres",
    period_all: "Wszystko",
    from_date: "Od",
    to_date: "Do",
    select_day: "Dzień",
    apply_filter: "Zastosuj",
    btn_export_csv: "📥 Eksportuj (CSV)",
    exporting: "Eksportowanie...",

    // Dashboard - Summary Cards
    card_balance: "Aktualne saldo",
    card_income: "Przychody łączne",
    card_expense: "Wydatki łączne",

    // Dashboard - Transaction Form
    form_heading: "Nowa transakcja",
    btn_manage_categories: "Kategorie",
    type_expense: "Wydatek",
    type_income: "Przychód",
    amount_placeholder: "Kwota",
    comment_placeholder: "Komentarz (np. Obiad, paliwo, premia...)",
    btn_add_transaction: "Dodaj operację",

    // Dashboard - Chart
    chart_title: "Struktura wydatków",
    chart_empty: "Brak wydatków do wyświetlenia wykresu.\nDodaj swoją pierwszą operację powyżej!",

    // Dashboard - Transactions List
    list_title: "Ostatnie operacje",
    filter_all: "Wszystkie",
    filter_expenses: "Wydatki",
    filter_incomes: "Przychody",
    list_empty: "Brak zarejestrowanych operacji",
    delete_tx_confirm: "Czy na pewno chcesz usunąć tę operację?",
    delete_tx_tooltip: "Usuń wpis",

    // Category Modal
    cat_modal_title: "Zarządzanie kategoriami",
    cat_tab_expense: "Kategorie wydatków",
    cat_tab_income: "Kategorie przychodów",
    cat_name_placeholder: "Nowa kategoria (np. Siłownia, Kawiarnia...)",
    cat_add_btn: "+ Dodaj",
    cat_badge_default: "Domyślna",
    cat_delete_confirm: "Czy na pewno chcesz usunąć kategorię",
    cat_delete_tooltip: "Usuń własną kategorię",
    cat_color_tooltip: "Wybierz własny kolor",
    cat_create_error: "Błąd podczas tworzenia kategorii",
    cat_delete_error: "Błąd podczas usuwania kategorii",

    // Edit Transaction Modal
    edit_modal_title: "Edytuj operację",
    edit_tx_tooltip: "Edytuj wpis",
    btn_save: "Zapisz zmiany",
    btn_cancel: "Anuluj",
    edit_success: "Operacja zaktualizowana!",
    edit_error: "Nie udało się zaktualizować operacji",

    // Default Categories
    cat_Food: "Jedzenie",
    cat_Transport: "Transport",
    cat_Rent: "Czynsz / Mieszkanie",
    cat_Entertainment: "Rozrywka",
    cat_Health: "Zdrowie",
    cat_Bills: "Rachunki",
    cat_Shopping: "Zakupy",
    cat_Salary: "Wynagrodzenie",
    cat_Freelance: "Freelance / Zlecenia",
    cat_Gift: "Prezent",
    cat_Investments: "Inwestycje",
    cat_Other: "Inne",

    // General
    loading_app: "Ładowanie LifeTrack...",
    dashboard_overview: "Przegląd finansowy",
    btn_new_transaction: "Nowa operacja",
    menu_language: "Język interfejsu",
    menu_currency: "Waluta konta",
    menu_categories: "Kategorie operacji",
    menu_budget: "Miesięczny limit wydatków",
    menu_export_csv: "Eksportuj dane (CSV)",
    menu_api_docs: "Dokumentacja API (Swagger)",
    menu_delete_account: "Usuń konto (RODO Art. 17)",
    delete_account_tooltip: "Usuń konto i dane (RODO Art. 17)",
    delete_account_confirm: "⚠️ Czy na pewno chcesz trwale usunąć swoje konto oraz wszystkie transakcje i kategorie (zgodnie z prawem do bycia zapomnianym RODO)? Tej operacji nie można cofnąć!",
    delete_account_demo_error: "Konto demonstracyjne nie może zostać usunięte.",

    // Budget Limit Card
    budget_title: "🎯 Miesięczny limit wydatków",
    budget_not_set: "Nie ustawiono jeszcze limitu wydatków na miesiąc",
    budget_set_btn: "Ustaw limit",
    budget_edit_btn: "Zmień limit",
    budget_spent: "Wydano",
    budget_remaining: "Pozostało",
    budget_exceeded: "⚠️ Przekroczono limit o",
    budget_warning: "⚡ Uwaga! Wykorzystano ponad 80% budżetu",
    budget_placeholder: "Kwota limitu",
    budget_clear: "Usuń limit",

    // Search & Category filter in list
    search_placeholder: "Szukaj po komentarzu lub kategorii...",
    all_categories: "Wszystkie kategorie",

    // Chart tabs
    chart_tab_doughnut: "Struktura",
    chart_tab_bar: "Bilans",
    bar_income: "Przychody",
    bar_expense: "Wydatki",
  },
  en: {
    // Brand & Header
    brand_subtitle: "Personal Finance Management System",
    server_online: "Server online",
    server_offline: "Server offline 🔴",
    logout: "Log out",
    
    // Auth Modal
    auth_title: "LifeTrack",
    auth_subtitle: "Personal Finance Tracking System",
    tab_login: "Login",
    tab_register: "Register",
    your_name: "Your name",
    name_placeholder: "e.g. John",
    main_currency: "Main currency",
    email: "Email address",
    password: "Password",
    btn_login: "Log in to account",
    btn_register: "Sign up",
    demo_login: "⚡ Quick login (Demo account)",
    loading: "Loading...",
    auth_error: "Authentication error",
    demo_error: "Failed to log in with demo account",
    gdpr_label_prefix: "I consent to the processing of my personal data in accordance with the ",
    gdpr_link: "GDPR Privacy Notice",
    gdpr_required_error: "You must accept the GDPR data processing consent to register.",
    gdpr_modal_title: "🔒 GDPR Information Clause (RODO)",
    gdpr_modal_text: "In accordance with Art. 13 of the General Data Protection Regulation (EU) 2016/679 (GDPR), please be informed that:\n\n1. The controller of your personal data is the LifeTrack system.\n2. We process the data provided during registration (email address, name, preferred currency, and financial transaction history) solely for the purpose of providing personal budget management services.\n3. The legal basis for processing is your voluntary consent (Art. 6(1)(a) GDPR) and service performance (Art. 6(1)(b) GDPR).\n4. Your data is securely stored in the database (passwords are hashed using bcrypt) and is never shared with third parties.\n5. You have the right to access, rectify, export (CSV), or request erasure of your personal data at any time.",
    gdpr_close: "Got it, close",

    // Period Filter & Export
    period_this_month: "This Month",
    period_this_week: "This Week",
    period_single_day: "Day",
    period_custom_range: "Custom Range",
    period_all: "All Time",
    from_date: "From",
    to_date: "To",
    select_day: "Day",
    apply_filter: "Apply",
    btn_export_csv: "📥 Export (CSV)",
    exporting: "Exporting...",

    // Dashboard - Summary Cards
    card_balance: "Current Balance",
    card_income: "Total Income",
    card_expense: "Total Expenses",

    // Dashboard - Transaction Form
    form_heading: "New Transaction",
    btn_manage_categories: "Categories",
    type_expense: "Expense",
    type_income: "Income",
    amount_placeholder: "Amount",
    comment_placeholder: "Comment (e.g. Lunch, gas, bonus...)",
    btn_add_transaction: "Add Transaction",

    // Dashboard - Chart
    chart_title: "Expenses Breakdown",
    chart_empty: "No expenses to display on the chart.\nAdd your first transaction above!",

    // Dashboard - Transactions List
    list_title: "Recent Transactions",
    filter_all: "All",
    filter_expenses: "Expenses",
    filter_incomes: "Income",
    list_empty: "No transactions recorded yet",
    delete_tx_confirm: "Are you sure you want to delete this transaction?",
    delete_tx_tooltip: "Delete record",

    // Category Modal
    cat_modal_title: "Manage Categories",
    cat_tab_expense: "Expense Categories",
    cat_tab_income: "Income Categories",
    cat_name_placeholder: "New category (e.g. Gym, Coffee...)",
    cat_add_btn: "+ Add",
    cat_badge_default: "Default",
    cat_delete_confirm: "Are you sure you want to delete category",
    cat_delete_tooltip: "Delete custom category",
    cat_color_tooltip: "Choose custom color",
    cat_create_error: "Failed to create category",
    cat_delete_error: "Failed to delete category",

    // Edit Transaction Modal
    edit_modal_title: "Edit Transaction",
    edit_tx_tooltip: "Edit record",
    btn_save: "Save changes",
    btn_cancel: "Cancel",
    edit_success: "Transaction updated!",
    edit_error: "Failed to update transaction",

    // Default Categories
    cat_Food: "Food",
    cat_Transport: "Transport",
    cat_Rent: "Rent",
    cat_Entertainment: "Entertainment",
    cat_Health: "Health",
    cat_Bills: "Bills",
    cat_Shopping: "Shopping",
    cat_Salary: "Salary",
    cat_Freelance: "Freelance",
    cat_Gift: "Gift",
    cat_Investments: "Investments",
    cat_Other: "Other",

    // General
    loading_app: "Loading LifeTrack...",
    dashboard_overview: "Financial Overview",
    btn_new_transaction: "New Transaction",
    menu_language: "Interface Language",
    menu_currency: "Account Currency",
    menu_categories: "Transaction Categories",
    menu_budget: "Monthly Expense Limit",
    menu_export_csv: "Export Data (CSV)",
    menu_api_docs: "API Documentation (Swagger)",
    menu_delete_account: "Delete Account (GDPR Art. 17)",
    delete_account_tooltip: "Delete account & data (GDPR Art. 17)",
    delete_account_confirm: "⚠️ Are you sure you want to permanently delete your account and all transactions/categories (GDPR Right to Erasure)? This action cannot be undone!",
    delete_account_demo_error: "Demo account cannot be deleted.",

    // Budget Limit Card
    budget_title: "🎯 Monthly Expense Limit",
    budget_not_set: "No monthly expense limit set yet",
    budget_set_btn: "Set limit",
    budget_edit_btn: "Edit limit",
    budget_spent: "Spent",
    budget_remaining: "Remaining",
    budget_exceeded: "⚠️ Limit exceeded by",
    budget_warning: "⚡ Warning! Over 80% of monthly budget used",
    budget_placeholder: "Limit amount",
    budget_clear: "Clear limit",

    // Search & Category filter in list
    search_placeholder: "Search by comment or category...",
    all_categories: "All categories",

    // Chart tabs
    chart_tab_doughnut: "Breakdown",
    chart_tab_bar: "Cashflow",
    bar_income: "Income",
    bar_expense: "Expenses",
  }
};
