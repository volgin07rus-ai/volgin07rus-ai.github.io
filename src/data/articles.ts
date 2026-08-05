export type Block =
  | { t: 'p'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'quote'; text: string }
  | { t: 'code'; text: string }

export type ArticleText = {
  title: string
  excerpt: string
  body: Block[]
}

export type Article = {
  slug: string
  /** ISO-дата — используется для сортировки */
  date: string
  dateRu: string
  dateEn: string
  minutes: number
  /** Проект, к которому относится разбор */
  project: string
  projectUrl?: string
  ru: ArticleText
  en: ArticleText
}

/**
 * Статьи — разборы реальных инженерных решений из проекта Nook.
 * Основаны на проектной документации, а не придуманы для вида.
 */
export const ARTICLES: Article[] = [
  {
    slug: 'widget-without-blur',
    date: '2026-08-01',
    dateRu: '1 августа 2026',
    dateEn: 'Aug 1, 2026',
    minutes: 4,
    project: 'Nook',
    projectUrl: 'https://github.com/volgin07rus-ai/nook',
    ru: {
      title: 'Виджет, который намеренно не размывает фон',
      excerpt:
        'Windows не даёт стороннему окну удержать живое размытие. Разбор, почему в Nook вместо модного acrylic — обычная прозрачность, и почему это правильный выбор.',
      body: [
        {
          t: 'p',
          text: 'Панель виджетов Windows 11 открывается по Win+W и закрыта для сторонних приложений. Поэтому виджет Nook сделан иначе: окно прижимается к нижнему слою и живёт прямо на рабочем столе. Другие окна его перекрывают, но стоит их свернуть — он на месте, всегда открытый. В панели задач при этом не мелькает.',
        },
        { t: 'h2', text: 'Соблазн добавить размытие' },
        {
          t: 'p',
          text: 'Первое, чего хочется от полупрозрачной панели, — живое размытие под ней. Так выглядят системные элементы Windows, так выглядит macOS. Проблема в том, что стороннему приложению система этого не даёт.',
        },
        {
          t: 'p',
          text: 'Acrylic Windows гасит у неактивных окон — это поведение самой системы, а не настройка приложения. Legacy blur-behind на Windows 11 вообще перестал размывать: он просто заливает окно плоским серым.',
        },
        { t: 'h2', text: 'Почему это ломает именно виджет' },
        {
          t: 'p',
          text: 'Ключевой момент — режим работы. Виджет на рабочем столе активен почти никогда: он по определению лежит под другими окнами, фокус на нём не задерживается. То есть любой из этих эффектов пропадал бы ровно тогда, когда он нужен, — и появлялся бы только в момент, когда пользователь на виджет кликнул.',
        },
        {
          t: 'quote',
          text: 'Эффект, который исчезает в основном сценарии использования, — это не эффект, а баг с красивым названием.',
        },
        { t: 'h2', text: 'Что осталось вместо' },
        {
          t: 'p',
          text: 'Обычная прозрачность. Она не зависит от фокуса и ведёт себя одинаково всегда: и когда окно активно, и когда лежит под четырьмя другими. Плотность фона настраивается от 10 до 100% — пользователь сам выбирает, насколько виджет должен растворяться в обоях.',
        },
        {
          t: 'p',
          text: 'Вывод, который я забрал с собой: если платформа не гарантирует эффект во всех состояниях компонента, честнее не использовать его вовсе. Стабильная простота читается как качество, мерцающая красота — как недоделка.',
        },
      ],
    },
    en: {
      title: 'A widget that deliberately does not blur its background',
      excerpt:
        'Windows will not let a third-party window hold live blur. Why Nook uses plain transparency instead of fashionable acrylic — and why that is the right call.',
      body: [
        {
          t: 'p',
          text: 'The Windows 11 widget panel opens with Win+W and is closed to third-party apps. So the Nook widget works differently: the window is pinned to the bottom layer and lives directly on the desktop. Other windows cover it, but minimise them and it is still there, always open — and it never flickers in the taskbar.',
        },
        { t: 'h2', text: 'The temptation to add blur' },
        {
          t: 'p',
          text: 'The first thing you want from a translucent panel is live blur underneath. That is how system surfaces look on Windows, and how macOS looks. The problem is that the system does not grant this to third-party applications.',
        },
        {
          t: 'p',
          text: 'Windows dims acrylic on inactive windows — that is the operating system’s behaviour, not an app setting. Legacy blur-behind on Windows 11 stopped blurring altogether: it simply fills the window with flat grey.',
        },
        { t: 'h2', text: 'Why this breaks a widget specifically' },
        {
          t: 'p',
          text: 'The key point is the usage mode. A desktop widget is almost never active: by definition it sits under other windows and focus does not linger on it. So either effect would disappear exactly when it was needed, and appear only the moment the user clicked the widget.',
        },
        {
          t: 'quote',
          text: 'An effect that vanishes in the primary use case is not an effect — it is a bug with a nice name.',
        },
        { t: 'h2', text: 'What replaced it' },
        {
          t: 'p',
          text: 'Plain transparency. It does not depend on focus and behaves identically at all times — when the window is active and when it sits beneath four others. Background density is configurable from 10% to 100%, so the user decides how far the widget dissolves into the wallpaper.',
        },
        {
          t: 'p',
          text: 'The takeaway: if a platform cannot guarantee an effect across every state of a component, it is more honest not to use it at all. Stable simplicity reads as quality; flickering beauty reads as unfinished work.',
        },
      ],
    },
  },

  {
    slug: 'reminders-in-rust',
    date: '2026-07-31',
    dateRu: '31 июля 2026',
    dateEn: 'Jul 31, 2026',
    minutes: 4,
    project: 'Nook',
    projectUrl: 'https://github.com/volgin07rus-ai/nook',
    ru: {
      title: 'Почему очередь напоминаний пришлось унести в Rust',
      excerpt:
        'Браузерные таймеры у скрытых окон душит сама система. А напоминание нужно именно тогда, когда окно свёрнуто — то есть ровно в тот момент, когда таймер не сработает.',
      body: [
        {
          t: 'p',
          text: 'Nook собран на Tauri: интерфейс — React, оболочка — Rust. Логично было бы держать всю логику во фронтенде и не трогать нативную часть без нужды. С напоминаниями так не вышло.',
        },
        { t: 'h2', text: 'Ловушка очевидного решения' },
        {
          t: 'p',
          text: 'Очевидное решение — setTimeout или setInterval в JavaScript: проверяем список задач, наступило время — показываем уведомление. На активном окне это работает безупречно.',
        },
        {
          t: 'p',
          text: 'Проблема в том, что Windows душит таймеры у скрытых и свёрнутых окон — это механизм экономии ресурсов, и он работает против нас. А теперь посмотрим на сценарий: когда именно пользователю нужно напоминание о задаче?',
        },
        {
          t: 'quote',
          text: 'Ровно тогда, когда он не смотрит в приложение. То есть когда окно свёрнуто — и когда таймер задушен.',
        },
        {
          t: 'p',
          text: 'Получается, что единственный сценарий, ради которого напоминания вообще существуют, — это в точности тот сценарий, в котором наивная реализация не срабатывает.',
        },
        { t: 'h2', text: 'Решение' },
        {
          t: 'p',
          text: 'Очередь напоминаний живёт в Rust и проверяется раз в 20 секунд. Нативный поток системным троттлингом не задет: он работает вне зависимости от того, свёрнуто окно, скрыто оно в трей или пользователь вообще о приложении забыл.',
        },
        {
          t: 'p',
          text: 'Отсюда вытекает и поведение крестика: он не закрывает приложение, а прячет его в трей. Иначе виджет пропал бы с экрана, а очередь напоминаний перестала бы существовать. Полный выход — правый клик по значку в трее.',
        },
        { t: 'h2', text: 'Что это меняет в повторяющихся задачах' },
        {
          t: 'p',
          text: 'Повторяющиеся задачи опираются на ту же очередь. Когда задача отмечена выполненной, следующая создаётся сама: с обнулённым чек-листом подзадач и сдвинутым напоминанием. Логика переноса срока живёт рядом с очередью, а не в интерфейсе, — поэтому она отрабатывает независимо от того, открыто окно или нет.',
        },
        {
          t: 'p',
          text: 'Общий принцип: определи, в каком состоянии функция обязана работать, и только потом выбирай, где её разместить. Для напоминаний это состояние — «приложение не на экране», и оно сразу отсекает весь фронтенд.',
        },
      ],
    },
    en: {
      title: 'Why the reminder queue had to move into Rust',
      excerpt:
        'The system throttles browser timers in hidden windows. And a reminder is needed exactly when the window is minimised — precisely when the timer will not fire.',
      body: [
        {
          t: 'p',
          text: 'Nook is built on Tauri: React for the interface, Rust for the shell. It would make sense to keep all the logic in the frontend and not touch the native side without reason. Reminders did not work out that way.',
        },
        { t: 'h2', text: 'The trap in the obvious solution' },
        {
          t: 'p',
          text: 'The obvious solution is setTimeout or setInterval in JavaScript: check the task list, and when the time arrives, show a notification. With an active window this works flawlessly.',
        },
        {
          t: 'p',
          text: 'The problem is that Windows throttles timers in hidden and minimised windows — a resource-saving mechanism that works against us here. Now consider the scenario: when exactly does a user need a task reminder?',
        },
        {
          t: 'quote',
          text: 'Exactly when they are not looking at the app. That is, when the window is minimised — and the timer is throttled.',
        },
        {
          t: 'p',
          text: 'So the single scenario reminders exist for is precisely the scenario in which the naive implementation fails.',
        },
        { t: 'h2', text: 'The solution' },
        {
          t: 'p',
          text: 'The reminder queue lives in Rust and is checked every 20 seconds. A native thread is untouched by system throttling: it runs whether the window is minimised, hidden in the tray, or the user has forgotten the app exists.',
        },
        {
          t: 'p',
          text: 'This also dictates what the close button does: it does not quit the app, it hides it to the tray. Otherwise the widget would vanish from the screen and the reminder queue would cease to exist. A full exit is a right-click on the tray icon.',
        },
        { t: 'h2', text: 'What this changes for recurring tasks' },
        {
          t: 'p',
          text: 'Recurring tasks rely on the same queue. When a task is completed the next one is created automatically, with a reset subtask checklist and a shifted reminder. The date-rollover logic lives next to the queue rather than in the interface, so it runs regardless of whether a window is open.',
        },
        {
          t: 'p',
          text: 'The general principle: decide which state a feature must work in, and only then choose where to put it. For reminders that state is “the app is not on screen”, and it rules out the entire frontend immediately.',
        },
      ],
    },
  },

  {
    slug: 'unlayered-css-broke-buttons',
    date: '2026-07-29',
    dateRu: '29 июля 2026',
    dateEn: 'Jul 29, 2026',
    minutes: 5,
    project: 'Nook',
    projectUrl: 'https://github.com/volgin07rus-ai/nook',
    ru: {
      title: 'Одна неслоёная строка CSS, которая молча погасила все кнопки',
      excerpt:
        'Правило без @layer побеждает любое слоёное — независимо от специфичности. Как из-за этого тёмный текст оказался на тёмном фоне, и что ещё держит цвет в Nook.',
      body: [
        {
          t: 'p',
          text: 'Самые дорогие баги — те, что не падают. Ничего не ломается, консоль чистая, сборка зелёная — просто интерфейс выглядит не так, как задумано, и непонятно почему.',
        },
        { t: 'h2', text: 'Что произошло' },
        {
          t: 'p',
          text: 'В проекте базовые стили лежат в каскадном слое:',
        },
        { t: 'code', text: '@layer base {\n  button { color: inherit; }\n}' },
        {
          t: 'p',
          text: 'Пока правило внутри слоя — всё в порядке: утилитарные классы с цветом его перебивают. Но стоит той же строке оказаться вне слоя, как она начинает выигрывать у всего слоёного разом.',
        },
        {
          t: 'quote',
          text: 'Неслоёные правила побеждают любые слоёные — и специфичность здесь ни при чём. Слой в каскаде оценивается раньше неё.',
        },
        {
          t: 'p',
          text: 'В результате неслоёный button { color: inherit } молча отменил все цветовые утилиты на кнопках. Кнопки унаследовали цвет родителя — и в тёмной теме получился тёмный текст на тёмном фоне. Ни ошибки, ни предупреждения: просто нечитаемые кнопки.',
        },
        { t: 'h2', text: 'Почему это легко пропустить' },
        {
          t: 'p',
          text: 'Привычка отлаживать CSS через специфичность здесь не помогает: селектор с классом «сильнее» голого button, и по старым правилам он должен был выиграть. Каскадные слои меняют порядок разбора — сначала слой, и только потом специфичность внутри него. Пока это не сидит в голове, поведение выглядит необъяснимым.',
        },
        { t: 'h2', text: 'Что ещё держит цвет' },
        {
          t: 'p',
          text: 'Вся палитра описана в OKLCH. Нейтральные поверхности несут след акцентного тона, поэтому серый нигде не выглядит мёртвым. Но цветность в тёмной теме удерживается на 0.003 — иначе фон читается не как почти чёрный, а как коричневатый.',
        },
        {
          t: 'p',
          text: 'Из этого следует отказ от пипетки: акцент выбирается из закрытого набора. Произвольный цвет разошёлся бы с подкрашенными нейтралями и сломал бы всю сборку тонов.',
        },
        { t: 'h2', text: 'Контраст' },
        {
          t: 'p',
          text: 'Контраст проверен сплошным прогоном по всем текстовым элементам в обеих темах: худшая пара держится выше требования WCAG AA — 4.5:1.',
        },
        {
          t: 'p',
          text: 'Отдельная ловушка обнаружилась в выделенных строках. Приглушённый токен подобран под фон канвы, но на подсветке выделения фон темнее — контраст проседает. Поэтому в активных строках текст поднимается на ступень. Такие вещи не видны на статичном макете и всплывают только при полном прогоне.',
        },
      ],
    },
    en: {
      title: 'One unlayered line of CSS that silently killed every button',
      excerpt:
        'A rule outside @layer beats any layered rule, regardless of specificity. How that put dark text on a dark background — and what else holds the colour system together.',
      body: [
        {
          t: 'p',
          text: 'The most expensive bugs are the ones that do not crash. Nothing breaks, the console is clean, the build is green — the interface simply does not look the way it was designed, and it is not clear why.',
        },
        { t: 'h2', text: 'What happened' },
        { t: 'p', text: 'Base styles in the project live in a cascade layer:' },
        { t: 'code', text: '@layer base {\n  button { color: inherit; }\n}' },
        {
          t: 'p',
          text: 'While the rule is inside the layer everything is fine: colour utility classes override it. But move that same line outside the layer and it starts winning against everything layered at once.',
        },
        {
          t: 'quote',
          text: 'Unlayered rules beat any layered rule — and specificity has nothing to do with it. The layer is evaluated earlier in the cascade.',
        },
        {
          t: 'p',
          text: 'As a result an unlayered button { color: inherit } silently cancelled every colour utility on buttons. Buttons inherited the parent colour, and in the dark theme that produced dark text on a dark background. No error, no warning: just unreadable buttons.',
        },
        { t: 'h2', text: 'Why it is easy to miss' },
        {
          t: 'p',
          text: 'The habit of debugging CSS through specificity does not help here: a class selector is “stronger” than a bare button, and by the old rules it should have won. Cascade layers change the order of evaluation — layer first, specificity only within it. Until that is second nature, the behaviour looks inexplicable.',
        },
        { t: 'h2', text: 'What else holds the colour together' },
        {
          t: 'p',
          text: 'The whole palette is written in OKLCH. Neutral surfaces carry a trace of the accent hue, so grey never looks dead. But chroma in the dark theme is held at 0.003 — otherwise the background reads not as near-black but as brownish.',
        },
        {
          t: 'p',
          text: 'That rules out a colour picker: the accent is chosen from a closed set. An arbitrary colour would drift away from the tinted neutrals and break the whole tonal system.',
        },
        { t: 'h2', text: 'Contrast' },
        {
          t: 'p',
          text: 'Contrast was verified by a full sweep across every text element in both themes: the worst pair stays above the WCAG AA requirement of 4.5:1.',
        },
        {
          t: 'p',
          text: 'A separate trap turned up in selected rows. The muted token was tuned against the canvas background, but on the selection highlight the background is darker, so contrast drops. That is why text in active rows steps up one level. Things like this are invisible in a static mockup and only surface in a full sweep.',
        },
      ],
    },
  },
]
