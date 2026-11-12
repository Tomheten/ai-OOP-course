/**
 * ============================================================
 * ЗАДАЧА 5. НОВЫЕ ТРЕБОВАНИЯ И «ВРЕМЕННЫЕ» ДВЕРИ
 * Блок 1. От функций к объектам
 * ============================================================
 *
 * Контекст: конфигурация из Задачи 4 обросла требованиями.
 * Нужны: проверка (validate), сброс к заводским значениям
 * (reset), экспорт для человека (export) и независимая копия
 * для экспериментов (clone).
 *
 * В Задаче 4 мы построили границу знания: внутренности закрыты,
 * контракт говорит на языке операций. Но код не стоит на месте.
 * Каждое новое требование — это новое поведение, которому нужны
 * данные объекта. Вопрос задачи: куда его селить?
 *
 * ЗАДАНИЕ:
 *   К конфигурации добавь:
 *   - validate;
 *   - reset;
 *   - export;
 *   - clone.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ------------------------------------------------------------
 * ПРО СТРУКТУРУ ФАЙЛА
 * ------------------------------------------------------------
 * Ниже две версии, каждая в своём namespace.
 * Файловый ввод-вывод симулируется (переменная fakeFs).
 */

/**
 * ============================================================
 * ШАГ 1. ФУНКЦИИ СНАРУЖИ + «ВРЕМЕННЫЕ» ДВЕРИ
 * ============================================================
 * Команда решила: «объект не трогаем, новые функции напишем
 * рядом». Но внешним функциям нужны внутренности — и в объект
 * добавили «временную» пару getData/setData.
 * «Временное» в коде живёт дольше всего.
 */
namespace ConfigWithBackdoor {
  /** Симуляция файловой системы. */
  const fakeFs: Record<string, string> = {
    "config.json": JSON.stringify({
      port: 3000,
      host: "localhost",
      debug: false,
      logLevel: "info",
    }),
  };

  function readFile(path: string): string {
    return fakeFs[path];
  }

  function writeFile(path: string, content: string): void {
    fakeFs[path] = content;
  }

  type AppConfig = {
    port: number;
    host: string;
    debug: boolean;
    logLevel: string;
  };

  const LOG_LEVELS = ["debug", "info", "warn", "error"];

  function createConfig(filePath: string) {
    /**
     * Ради универсальных дверей («отдай всё» / «прими всё»)
     * состояние снова стало плоской записью: logLevel опять
     * ХРАНИТСЯ, а не вычисляется. Иначе setData не смог бы
     * восстановить состояние целиком.
     * Запомни это: двери потянули за собой откат Задачи 4.
     */
    let data: AppConfig = JSON.parse(readFile(filePath));

    return {
      getSource(): string {
        return filePath;
      },
      getAddress(): string {
        return `${data.host}:${data.port}`;
      },
      setPort(value: number): void {
        if (!Number.isInteger(value) || value <= 0 || value > 65535) {
          throw new Error("Некорректный порт: " + value);
        }
        data.port = value;
      },
      enableDebug(): void {
        data.debug = true;
        data.logLevel = "debug"; // пара поддерживается — пока идут через методы
      },
      disableDebug(): void {
        data.debug = false;
        data.logLevel = "info";
      },
      isDebug(): boolean {
        return data.debug;
      },
      getLogLevel(): string {
        return data.logLevel;
      },
      save(): void {
        writeFile(filePath, JSON.stringify(data));
      },

      /** «Временные» двери — ради внешних функций ниже. */
      getData(): AppConfig {
        return { ...data };
      },
      setData(next: AppConfig): void {
        data = { ...next }; // ни одно правило здесь не работает
      },
    };
  }

  /**
   * Почему двери вообще появились? Попробуй написать эти функции
   * через контракт из Задачи 4 — и упрёшься:
   *   - export: нужен port отдельно, а есть только getAddress() —
   *     пришлось бы парсить строку "localhost:8080";
   *   - clone: createConfig читает ФАЙЛ, а в объекте — несохранённые
   *     изменения; пришлось бы сначала save() — запись на диск ради копии;
   *   - reset: возможен через сеттеры, но заводские значения
   *     всё равно поселятся снаружи.
   * Внешним функциям не хватает контракта. Дальше два пути:
   * расширить контракт ОПЕРАЦИЯМИ (Шаг 3) или открыть внутренности (здесь).
   */

  /** Заводские значения. Заметь: знание о формате хранения — снаружи. */
  const DEFAULTS: AppConfig = {
    port: 3000,
    host: "localhost",
    debug: false,
    logLevel: "info",
  };

  /** Типы параметров честно показывают, какие двери нужны функциям:
   * без getData/setData их сигнатуры не написать. */
  function validateConfig(config: { getData(): AppConfig; }): boolean {
    const d = config.getData();
    return (
      Number.isInteger(d.port) && d.port > 0 && d.port <= 65535 &&
      d.host.length > 0 &&
      LOG_LEVELS.includes(d.logLevel) &&
      (d.debug || d.logLevel !== "debug") // пара из Задачи 4 — теперь проверяется СНАРУЖИ
    );
  }

  function resetConfig(config: { setData(next: AppConfig): void; }): void {
    config.setData({ ...DEFAULTS });
  }

  function exportConfig(config: { getData(): AppConfig; }): string {
    return JSON.stringify(config.getData(), null, 2);
  }

  function cloneConfig(config: {
    getSource(): string;
    getData(): AppConfig;
    setData(next: AppConfig): void;
  }) {
    const copy = createConfig(config.getSource());
    copy.setData(config.getData());
    return copy;
  }

  /** Использование */
  const config = createConfig("config.json");
  config.setPort(8080);
  config.enableDebug();
  console.log("[backdoor] валиден?", validateConfig(config)); // true

  const draft = cloneConfig(config); // копия для экспериментов
  resetConfig(config);               // оригинал — к заводским
  console.log("[backdoor] оригинал после сброса:", exportConfig(config));
  console.log("[backdoor] копия:", exportConfig(draft));

  /** А теперь кто-то «поправил» копию через дверь: */
  draft.setData({ ...draft.getData(), debug: false }); // про logLevel забыли — снова
  console.log("[backdoor] копия валидна?", validateConfig(draft)); // false — привет, Задача 4

  /** Ещё вариант — попробуй сам: */
  // draft.setData({ ...draft.getData(), port: -1 }); // setPort бы не пустил, setData пускает
}

/**
 * ============================================================
 * ШАГ 2. ПРОВЕРКИ НА ПРОЧНОСТЬ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Двери обнуляют гарантии
 * ------------------------------------
 * setPort проверяет диапазон. enableDebug держит пару.
 * setData не проверяет НИЧЕГО — и им можно записать что угодно.
 *
 * Задача 4 сделала противоречие невыразимым. Двери сделали его
 * выразимым снова: чтобы setData принимал состояние целиком,
 * logLevel пришлось вернуть в хранимые данные.
 *
 * Инкапсуляция — не состояние «достигнуто однажды». Это свойство,
 * которое каждая новая строка кода либо сохраняет, либо отменяет.
 * Одна универсальная дверь отменяет все проверки разом.
 */

/**
 * СИТУАЦИЯ 2. Знания утекли обратно
 * ----------------------------------
 * Приложи линзу Задачи 4 — где теперь живут знания?
 *   - заводские значения — в DEFAULTS снаружи (и он знает формат
 *     хранения целиком: сменится формат — сломается и DEFAULTS);
 *   - правило пары — продублировано в validateConfig;
 *   - рецепт копии — в cloneConfig;
 *   - формат экспорта — в exportConfig.
 *
 * Каждая внешняя функция унесла кусок знания о конфиге наружу.
 * Смена внутренностей снова задевает всех — то, от чего уходили.
 */

/**
 * СИТУАЦИЯ 3. Кластер растёт, а validate — симптом
 * -------------------------------------------------
 * Имена снова стали «глагол + Config» (Задача 3). Новое требование
 * (merge, diff) — новая функция в кластере и новое использование дверей.
 *
 * И заметь: validateConfig существует ТОЛЬКО потому, что объекту
 * нельзя доверять. В Задаче 4 он был не нужен. Потребность проверять
 * объект снаружи — симптом пробитой границы, а не полезная фича.
 */

/**
 * ПАУЗА. СФОРМУЛИРУЙ ДЛЯ СЕБЯ
 * ---------------------------
 *   1. Что гарантируют setPort и enableDebug, если рядом есть setData?
 *   2. Где живут знания о заводских значениях, формате и паре?
 *   3. Почему validate снова понадобился?
 */

/**
 * ============================================================
 * ШАГ 3. НОВЫЕ ТРЕБОВАНИЯ — НОВЫЕ МЕТОДЫ
 * ============================================================
 * Те же четыре требования, но поведение живёт там, где данные.
 * Двери не нужны: внутри объекта видно всё, что нужно его поведению.
 */
namespace ConfigWithMethods {
  /** Симуляция файловой системы. */
  const fakeFs: Record<string, string> = {
    "config.json": JSON.stringify({
      port: 3000,
      host: "localhost",
      debug: false,
      logLevel: "info",
    }),
  };

  function readFile(path: string): string {
    return fakeFs[path];
  }

  function writeFile(path: string, content: string): void {
    fakeFs[path] = content;
  }

  /**
   * Контракт конфига, записанный явно. Открой его — и видно ВСЁ,
   * что умеет конфиг. Обрати внимание: clone() возвращает Config —
   * полноценный объект с поведением, а не запись данных.
   */
  type Config = {
    getSource(): string;
    getAddress(): string;
    setPort(value: number): void;
    enableDebug(): void;
    disableDebug(): void;
    isDebug(): boolean;
    getLogLevel(): string;
    save(): void;
    reset(): void;
    export(): string;
    clone(): Config;
  };

  /** Заводские значения — знание конфига, живёт рядом с ним.
   * Только то, что реально сбрасывается: host — адрес развёртывания,
   * он не меняется и сбросу не подлежит. Внешний DEFAULTS из Шага 1
   * знал весь формат хранения — этот знает только суть сброса. */
  const DEFAULTS = { port: 3000, debug: false };

  function createConfig(filePath: string): Config {
    const raw = JSON.parse(readFile(filePath));
    const host: string = raw.host;
    let port: number = raw.port;
    let debug: boolean = raw.debug;
    /** logLevel по-прежнему не хранится: истина — это debug (Задача 4). */

    function currentLogLevel(): string {
      return debug ? "debug" : "info";
    }

    /** Единственное место, где собирается представление для хранения. */
    function snapshot() {
      return { port, host, debug, logLevel: currentLogLevel() };
    }

    return {
      getSource(): string {
        return filePath;
      },
      getAddress(): string {
        return `${host}:${port}`;
      },
      setPort(value: number): void {
        if (!Number.isInteger(value) || value <= 0 || value > 65535) {
          throw new Error("Некорректный порт: " + value);
        }
        port = value;
      },
      enableDebug(): void {
        debug = true;
      },
      disableDebug(): void {
        debug = false;
      },
      isDebug(): boolean {
        return debug;
      },
      getLogLevel(): string {
        return currentLogLevel();
      },
      save(): void {
        writeFile(filePath, JSON.stringify(snapshot()));
      },

      /** ---- Новые требования — новые методы ---- */

      reset(): void {
        port = DEFAULTS.port;
        debug = DEFAULTS.debug;
      },

      /** Формат для человека: то же представление, что в save,
       * только с отступами. Сменится формат — правится snapshot. */
      export(): string {
        return JSON.stringify(snapshot(), null, 2);
      },

      /**
       * Клон — полноценный конфиг с поведением и правилами,
       * а не запись данных (сравни getData из Задачи 2: копия
       * данных не умеет ни проверок, ни save).
       *
       * Копия собирается через ПУБЛИЧНЫЙ контракт: порт пройдёт
       * проверку, уровень выведется сам. Двери не нужны — свои
       * port и debug видны из замыкания. Внешней функции не хватало
       * именно этого: доступа к СВОИМ данным без продажи их наружу.
       *
       * Клон наследует источник: draft.save() применит удачный
       * эксперимент к тому же файлу.
       */
      clone(): Config {
        const copy = createConfig(filePath);
        copy.setPort(port);
        if (debug) copy.enableDebug();
        else copy.disableDebug();
        return copy;
      },
    };
  }

  /** Использование: тот же сценарий, что в Шаге 1. */
  const config = createConfig("config.json");
  config.setPort(8080);
  config.enableDebug();

  const draft = config.clone();
  config.reset();

  console.log("[methods] оригинал после сброса:", config.export());
  console.log("[methods] копия:", draft.export());

  draft.disableDebug();
  console.log("[methods] уровень копии:", draft.getLogLevel()); // "info" — пара не ломается

  /**
   * Дверей нет, обойти правила нечем:
   */
  // draft.setData({ ... });      // ❌ нет такого метода
  // config.getData().port = -1;  // ❌ нет такого метода

  /**
   * А validate не нужен: невалидным конфиг быть не может.
   */
}

/**
 * ============================================================
 * ШАГ 4. ТЕ ЖЕ ПРОВЕРКИ
 * ============================================================
 *
 * СИТУАЦИЯ 1. Гарантии живы, validate растворился
 * Дверей нет — правила обойти нечем, противоречие по-прежнему
 * невыразимо. Требование validate не стало методом — оно РАСТВОРИЛОСЬ:
 * у корректного объекта проверять нечего. Лучшая проверка — та,
 * которая не нужна (Задача 4).
 *
 * СИТУАЦИЯ 2. Знания легли к данным
 * Заводские значения — внутри reset, и только сбрасываемые поля.
 * Представление для хранения — в snapshot, одном месте для save
 * и export. Рецепт копии — внутри clone. Смена формата хранения
 * снова правится в одном месте; внешний код — ноль изменений.
 *
 * СИТУАЦИЯ 3. Кластер не образовался
 * Четыре требования — три метода и одно растворившееся требование.
 * Завтрашний merge или diff — ещё метод, а не функция плюс двери.
 * И имя короче: config.export() вместо exportConfig(config) —
 * объект сам даёт контекст, «Config» в имени избыточно.
 */

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 *
 * Задача 4 построила границу знания. Эта задача показала: каждое
 * новое требование давит на неё. Внешней функции нужны внутренности —
 * и появляется соблазн «временных» дверей getData/setData. Двери
 * обнуляют все гарантии разом и выносят знания обратно наружу.
 *
 * Правило: поведение, которому нужны внутренности объекта, должно
 * жить ВНУТРИ объекта. Универсальные getData/setData — не нейтральное
 * удобство, а отмена инкапсуляции. А потребность валидировать объект
 * снаружи — симптом того, что граница уже пробита.
 *
 * Требование | Функции + двери            | Методы
 * -----------|----------------------------|---------------------------
 * reset      | DEFAULTS и формат снаружи  | знание внутри объекта
 * export     | зависит от getData         | общий snapshot с save
 * clone      | копия через двери          | через контракт, с правилами
 * validate   | нужен, дублирует правила   | растворился
 * Гарантии   | обходятся одной дверью     | сохраняются при росте
 *
 * Объект вырос до десятка методов, контракт записан типом. Но фабрика
 * каждый раз вручную собирает замыкание, состояние и методы. В языке
 * есть инструмент ровно для этого — КЛАСС. С него начнём следующую задачу.
 */