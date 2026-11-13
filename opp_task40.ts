/**
 * ============================================================
 * ЗАДАЧА 40. МИНИ-СИСТЕМА ЗАМЕТОК
 * Блок 5. Взаимодействие объектов
 * ============================================================
 *
 * Это итоговая задача Блока 5. Мы прошли путь от одного объекта
 * до системы из многих объектов, каждый из которых отвечает за
 * своё. Здесь собираем всё вместе.
 *
 * ЗАДАНИЕ:
 *   - Собери мини-систему заметок из всех компонентов.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. ВСЕ КОМПОНЕНТЫ СИСТЕМЫ
 * ============================================================
 */
namespace MiniNoteSystem {
  /** Заметка — богатая модель. */
  class Note {
    private title: string;
    private content: string;
    private readonly createdAt: string;

    constructor(title: string, content: string) {
      this.setTitle(title);
      this.content = content;
      this.createdAt = new Date().toISOString();
    }

    private setTitle(title: string): void {
      if (!title.trim()) {
        throw new Error("Заголовок не может быть пустым");
      }
      this.title = title;
    }

    rename(title: string): void {
      this.setTitle(title);
    }

    updateContent(content: string): void {
      this.content = content;
    }

    getTitle(): string {
      return this.title;
    }

    getContent(): string {
      return this.content;
    }
  }

  /** Хранилище — инкапсуляция хранения. */
  class NoteStore {
    private notes: Note[] = [];

    add(note: Note): void {
      this.notes.push(note);
    }

    getAll(): Note[] {
      return [...this.notes];
    }

    count(): number {
      return this.notes.length;
    }
  }

  /** История изменений. */
  class History {
    private entries: string[] = [];

    record(message: string): void {
      this.entries.push(message);
    }

    getEntries(): string[] {
      return [...this.entries];
    }
  }

  /** Журнал действий. */
  class ActionLog {
    private entries: string[] = [];

    log(action: string): void {
      this.entries.push(`[${new Date().toISOString()}] ${action}`);
    }

    getEntries(): string[] {
      return [...this.entries];
    }
  }

  /** Экспорт. */
  class NoteExporter {
    constructor(private notes: Note[]) {}

    exportAsText(): string {
      return this.notes
        .map((n) => `${n.getTitle()}: ${n.getContent()}`)
        .join("\n");
    }
  }

  /** Импорт. */
  class NoteImporter {
    importFromText(text: string): Note[] {
      return text
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [title, ...rest] = line.split(":");
          return new Note(title.trim(), rest.join(":").trim());
        });
    }
  }

  /** Координатор — управляет всем процессом. */
  class NoteSystem {
    private readonly store: NoteStore;
    private readonly history: History;
    private readonly log: ActionLog;

    constructor() {
      this.store = new NoteStore();
      this.history = new History();
      this.log = new ActionLog();
    }

    createNote(title: string, content: string): Note {
      const note = new Note(title, content);
      this.store.add(note);
      this.history.record(`Создана заметка "${title}"`);
      this.log.log(`create: ${title}`);
      return note;
    }

    renameNote(note: Note, title: string): void {
      note.rename(title);
      this.history.record(`Заметка переименована в "${title}"`);
      this.log.log(`rename: ${title}`);
    }

    exportNotes(): string {
      const exporter = new NoteExporter(this.store.getAll());
      return exporter.exportAsText();
    }

    importNotes(text: string): number {
      const importer = new NoteImporter();
      const notes = importer.importFromText(text);
      for (const note of notes) {
        this.store.add(note);
      }
      this.log.log(`import: ${notes.length} заметок`);
      return notes.length;
    }

    getStats(): { total: number; historyEntries: number; logEntries: number } {
      return {
        total: this.store.count(),
        historyEntries: this.history.getEntries().length,
        logEntries: this.log.getEntries().length,
      };
    }
  }

  /** Использование: вся система в действии. */
  const system = new NoteSystem();

  const note1 = system.createNote("Идеи", "Сделать проект");
  system.createNote("Покупки", "Молоко, хлеб");
  system.renameNote(note1, "Идеи для проекта");

  const imported = system.importNotes("Работа: Написать отчёт");
  console.log("[mini-system] импортировано:", imported);

  console.log("[mini-system] экспорт:\n" + system.exportNotes());
  console.log("[mini-system] статистика:", system.getStats());
}

/**
 * ============================================================
 * ШАГ 2. АРХИТЕКТУРА СИСТЕМЫ
 * ============================================================
 */

/**
 * Что у нас получилось:
 *
 *   - Note          — богатая модель, защищает себя;
 *   - NoteStore     — инкапсуляция хранения;
 *   - History       — история изменений;
 *   - ActionLog     — журнал действий;
 *   - NoteExporter  — экспорт;
 *   - NoteImporter  — импорт;
 *   - NoteSystem    — координатор.
 *
 * Семь классов, каждый отвечает за одно дело.
 */

/**
 * ============================================================
 * ШАГ 3. ПРИНЦИПЫ, КОТОРЫЕ МЫ ИСПОЛЬЗОВАЛИ
 * ============================================================
 */

/**
 * ПРИНЦИП 1. Одна ответственность на класс
 * ----------------------------------------
 * Каждый класс делает одно дело. Если у класса появляется
 * вторая ответственность — выделяем её в отдельный класс.
 */

/**
 * ПРИНЦИП 2. Богатые модели
 * -------------------------
 * Заметка защищает себя сама. Правила живут в объекте, а не
 * в сервисах вокруг.
 */

/**
 * ПРИНЦИП 3. Координация через один объект
 * ----------------------------------------
 * Координатор знает обо всех объектах и управляет процессом.
 * Остальные объекты знают только о себе.
 */

/**
 * ПРИНЦИП 4. Сквозные функциональности — отдельно
 * ------------------------------------------------
 * История, журнал, экспорт, импорт — всё это отдельные классы.
 * Их можно переиспользовать и тестировать отдельно.
 */

/**
 * ============================================================
 * ИТОГ БЛОКА 5
 * ============================================================
 *
 * Мы научились строить системы из взаимодействующих объектов:
 *   - выделять ответственности;
 *   - координировать объекты;
 *   - избегать дублирования;
 *   - работать со сквозными функциональностями.
 *
 * Блок 5 завершён.
 *
 * Дальше начинается Блок 6: полиморфизм для обработки файлов.
 * Мы применим идеи полиморфизма из Блока 2 к реальной задаче —
 * парсингу файлов разных форматов.
 */