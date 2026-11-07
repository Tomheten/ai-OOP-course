/**
 * ============================================================
 * ЗАДАЧА 5. СЛИШКОМ МНОГО ФУНКЦИЙ ВОКРУГ ОБЪЕКТА
 * Блок 1. От функций к объектам
 * ============================================================
 *
 * Контекст: конфигурация из Задачи 4 обросла новыми требованиями.
 * Теперь нужны: проверка (validate), сброс (reset), экспорт
 * (export) и клонирование (clone).
 *
 * В Задаче 4 поведение начало группироваться вокруг данных.
 * Здесь посмотрим, что происходит, когда вокруг ОДНОГО объекта
 * собирается ЦЕЛЫЙ КЛАСТЕР функций.
 *
 * ЗАДАНИЕ:
 *   К уже существующей конфигурации добавь:
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
 * ШАГ 1. КЛАСТЕР ФУНКЦИЙ ВОКРУГ ОБЪЕКТА
 * ============================================================
 * Один объект конфигурации — и целая стая функций вокруг него.
 */
namespace ConfigClusterFunctions {
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

  /** Значения по умолчанию для сброса. */
  const DEFAULTS: AppConfig = {
    port: 3000,
    host: "localhost",
    debug: false,
    logLevel: "info",
  };

  /** ---- Базовые функции (были раньше) ---- */
  function loadConfig(filePath: string): AppConfig {
    return JSON.parse(readFile(filePath));
  }

  function saveConfig(config: AppConfig, filePath: string): void {
    writeFile(filePath, JSON.stringify(config));
  }

  function setParam(config: AppConfig, key: string, value: any): void {
    (config as any)[key] = value;
  }

  /** ---- НОВЫЕ функции из задания ---- */

  /** Проверка корректности. */
  function validateConfig(config: AppConfig): boolean {
    return config.port > 0 && config.host.length > 0;
  }

  /** Сброс к значениям по умолчанию. */
  function resetConfig(config: AppConfig): void {
    Object.assign(config, DEFAULTS);
  }

  /** Экспорт в строку. */
  function exportConfig(config: AppConfig): string {
    return JSON.stringify(config, null, 2);
  }

  /** Клонирование. */
  function cloneConfig(config: AppConfig): AppConfig {
    /** Пока конфиг плоский, достаточно такого копирования */
    return { ...config };
  }

  /** Использование */
  const config = loadConfig("config.json");
  setParam(config, "port", 8080);
  console.log("[cluster] валиден:", validateConfig(config));
  const copy = cloneConfig(config);
  resetConfig(config);
  console.log("[cluster] после сброса:", config);
  console.log("[cluster] экспорт копии:", exportConfig(copy));
}

/**
 * ============================================================
 * ШАГ 2. ПРОВЕРКИ НА ПРОЧНОСТЬ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Посчитай функции
 * ----------------------------
 * Вокруг ОДНОГО объекта конфигурации теперь:
 *   loadConfig, saveConfig, setParam,
 *   validateConfig, resetConfig, exportConfig, cloneConfig.
 *
 * Восемь функций. И все они — про конфиг. Это уже не «пара
 * функций», это целый КЛАСТЕР, который живёт отдельно от объекта.
 */

/**
 * СИТУАЦИЯ 2. Кластер растёт
 * --------------------------
 * Каждое новое требование (например, «сравнить два конфига»,
 * «слить два конфига») — это ещё одна функция в кластере:
 *   diffConfig(a, b), mergeConfig(a, b)...
 *
 * Объект не меняется, а кластер вокруг него разрастается.
 */

/**
 * СИТУАЦИЯ 3. Кто здесь лишний?
 * -----------------------------
 * Посмотри на имена: validateConfig, resetConfig, exportConfig,
 * cloneConfig. Первое слово — глагол, второе — ВСЕГДА «Config».
 * Эти функции не существуют без конфига. Они — ЕГО поведение,
 * но почему-то живут снаружи.
 *
 * Кластер функций вокруг одной сущности — это сигнал:
 * поведению пора внутрь.
 */

/**
 * ПАУЗА. СФОРМУЛИРУЙ ДЛЯ СЕБЯ
 * ---------------------------
 *   1. Сколько функций крутится вокруг одного конфига?
 *   2. Что общего у всех этих функций?
 *   3. Удобно ли держать такой кластер отдельно от объекта?
 */

/**
 * ============================================================
 * ШАГ 3. ОБЪЕКТ + МЕТОДЫ (кластер переезжает внутрь)
 * ============================================================
 * Все функции кластера становятся методами конфигурации.
 * Объект с методами создаёт фабричная функция.
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

  type AppConfig = {
    port: number;
    host: string;
    debug: boolean;
    logLevel: string;
  };

  const DEFAULTS: AppConfig = {
    port: 3000,
    host: "localhost",
    debug: false,
    logLevel: "info",
  };

  /**
   * Фабрика создаёт конфигурацию и даёт ей ВСЁ поведение,
   * которое раньше было кластером функций.
   */
  function createConfig(filePath: string) {
    let data: AppConfig = JSON.parse(readFile(filePath));

    return {
      getSource(): string {
        return filePath;
      },

      save(): void {
        writeFile(filePath, JSON.stringify(data));
      },

      setParam(key: string, value: any): void {
        (data as any)[key] = value;
      },

      /** Всё, что было функциями, стало методами. */
      validate(): boolean {
        return data.port > 0 && data.host.length > 0;
      },

      reset(): void {
        data = { ...DEFAULTS };
      },

      export(): string {
        return JSON.stringify(data, null, 2);
      },

      /**Клон — это просто копия данных, без методов. Как getData() в Задаче 2 */
      clone(): AppConfig {
        return { ...data };
      },
    };
  }

  /** Использование: конфиг делает всё САМ. */
  const config = createConfig("config.json");
  config.setParam("port", 8080);
  console.log("[methods] валиден:", config.validate());
  const copy = config.clone();
  config.reset();
  console.log("[methods] после сброса:", config.export());
}

/**
 * ============================================================
 * ШАГ 4. ТЕ ЖЕ ПРОВЕРКИ
 * ============================================================
 *
 * СИТУАЦИЯ 1. Кластер исчез
 * Восемь функций превратились в методы одного объекта.
 * В файле больше нет «стаи» функций про конфиг — всё внутри.
 *
 * СИТУАЦИЯ 2. Рост больше не пугает
 * Новая операция над конфигом — новый метод. Объект растёт
 * вместе со своими возможностями, и всё остаётся в одном месте.
 *
 * СИТУАЦИЯ 3. Поведение принадлежит объекту
 * Открой объект, который возвращает фабрика:
 *   save, setParam, validate, reset, export, clone.
 * Вот всё, что можно сделать с конфигом. Кластер больше не нужен.
 */

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 *
 * Главный вывод этой задачи:
 *   Когда вокруг одного объекта собирается кластер функций —
 *   это явный сигнал, что данные и поведение нужно объединить.
 *   Функции, которые не существуют без объекта, — это его методы.
 *
 * Ситуация               | Кластер функций        | Методы объекта
 * -----------------------|------------------------|---------------------------
 * Функции про конфиг     | 8 штук отдельно        | методы внутри
 * Новая операция         | новая функция в кластере| новый метод
 * «Что можно сделать?»   | искать по файлу        | видно по объекту
 *
 * Мы объединяли данные и поведение через фабричные функции.
 * Это работает, но каждый раз мы вручную собираем объект,
 * замыкание и методы. В языке есть специальный инструмент
 * ровно для этого — КЛАСС.
 * Фабрика каждый раз вручную собирает замыкание и методы. Классы автоматизируют это.
 * С ним мы познакомимся в следующей
 * задаче.
 */