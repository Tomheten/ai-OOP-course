/**
 * ============================================================
 * ЗАДАЧА 50. ПЛАГИН НОВЫХ ФОРМАТОВ
 * Блок 6. Полиморфизм для обработки файлов
 * ============================================================
 *
 * В Задаче 49 мы удалили switch. Но выбор парсера всё ещё
 * происходит где-то наверху. Здесь сделаем его более гибким:
 * введём реестр парсеров. Новый формат добавляется без правки
 * существующего кода.
 *
 * ЗАДАНИЕ:
 *   - Создай реестр парсеров.
 *   - Добавь новый формат, не меняя клиентский код.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. РЕЕСТР ПАРСЕРОВ
 * ============================================================
 */
namespace PluginSystem {
  type Record = { id: number; name: string; value: number };

  interface Parser {
    parse(content: string): Record[];
  }

  class JsonParser implements Parser {
    parse(content: string): Record[] {
      return JSON.parse(content);
    }
  }

  class CsvParser implements Parser {
    parse(content: string): Record[] {
      const lines = content.trim().split("\n");
      return lines.slice(1).map((line) => {
        const [id, name, value] = line.split(",");
        return { id: Number(id), name: name.trim(), value: Number(value) };
      });
    }
  }

  /**
   * Реестр парсеров.
   * Хранит соответствие формата и парсера.
   */
  class ParserRegistry {
    private parsers: Map<string, Parser> = new Map();

    /** Регистрация нового формата. */
    register(format: string, parser: Parser): void {
      this.parsers.set(format, parser);
    }

    /** Получение парсера по формату. */
    get(format: string): Parser {
      const parser = this.parsers.get(format);
      if (!parser) {
        throw new Error("Нет парсера для формата: " + format);
      }
      return parser;
    }

    /** Проверка, поддерживается ли формат. */
    supports(format: string): boolean {
      return this.parsers.has(format);
    }
  }

  /** Использование: регистрируем форматы. */
  const registry = new ParserRegistry();
  registry.register("json", new JsonParser());
  registry.register("csv", new CsvParser());

  /** Клиент использует реестр. */
  function importFile(registry: ParserRegistry, format: string, content: string): Record[] {
    return registry.get(format).parse(content);
  }

  const json = JSON.stringify([{ id: 1, name: "A", value: 1 }]);
  const csv = "id,name,value\n2,B,2";

  console.log("[plugin] json:", importFile(registry, "json", json));
  console.log("[plugin] csv:", importFile(registry, "csv", csv));
}

/**
 * ============================================================
 * ШАГ 2. ДОБАВЛЯЕМ НОВЫЙ ФОРМАТ
 * ============================================================
 * Добавим TxtParser — без изменения существующего кода.
 */
namespace AddingNewFormat {
  type Record = { id: number; name: string; value: number };

  interface Parser {
    parse(content: string): Record[];
  }

  class JsonParser implements Parser {
    parse(content: string): Record[] {
      return JSON.parse(content);
    }
  }

  class CsvParser implements Parser {
    parse(content: string): Record[] {
      const lines = content.trim().split("\n");
      return lines.slice(1).map((line) => {
        const [id, name, value] = line.split(",");
        return { id: Number(id), name: name.trim(), value: Number(value) };
      });
    }
  }

  /** НОВЫЙ парсер. */
  class TxtParser implements Parser {
    parse(content: string): Record[] {
      return content.trim().split("\n").map((line) => {
        const [id, name, value] = line.split("|");
        return { id: Number(id), name: name.trim(), value: Number(value) };
      });
    }
  }

  class ParserRegistry {
    private parsers: Map<string, Parser> = new Map();

    register(format: string, parser: Parser): void {
      this.parsers.set(format, parser);
    }

    get(format: string): Parser {
      const parser = this.parsers.get(format);
      if (!parser) throw new Error("Нет парсера для формата: " + format);
      return parser;
    }
  }

  const registry = new ParserRegistry();
  registry.register("json", new JsonParser());
  registry.register("csv", new CsvParser());

  /**
   * Добавляем новый формат.
   * Единственное изменение — одна строка регистрации.
   * Клиентский код НЕ меняется.
   */
  registry.register("txt", new TxtParser());

  function importFile(registry: ParserRegistry, format: string, content: string): Record[] {
    return registry.get(format).parse(content);
  }

  const txt = "3|C|3";
  console.log("[new-format] txt:", importFile(registry, "txt", txt));
}

/**
 * ============================================================
 * ШАГ 3. ПРОВЕРКИ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Новый формат = одна строка
 * --------------------------------------
 * Чтобы поддержать новый формат, нужно:
 *   1. Создать класс, реализующий Parser;
 *   2. Зарегистрировать его в реестре одной строкой.
 *
 * Клиентский код не меняется вовсе.
 */

/**
 * СИТУАЦИЯ 2. Это и есть плагинная архитектура
 * ---------------------------------------------
 * Реестр парсеров — это простой плагин. Каждый парсер — это
 * плагин, который можно добавить или убрать, не трогая систему.
 */

/**
 * СИТУАЦИЯ 3. Форматов может быть сколько угодно
 * -----------------------------------------------
 * JSON, CSV, TXT, XML, YAML... Каждый новый формат — новый
 * парсер и одна строка регистрации. Система не распухает.
 */

/**
 * ============================================================
 * ИТОГ БЛОКА 6
 * ============================================================
 *
 * Мы прошли полный путь:
 *   один формат → рост числа импортеров → большой switch →
 *   интерфейс Parser → три реализации → удаление switch →
 *   плагинная архитектура.
 *
 * Ситуация              | Начало               | Конец
 * ----------------------|----------------------|---------------------------
 * Новый формат          | править клиент       | одна строка регистрации
 * Клиент знает про      | все форматы          | только контракт
 * Расширяемость         | низкая               | высокая
 *
 * Полиморфизм позволил системе расширяться без правки
 * существующего кода. Это и есть его сила.
 *
 * Блок 6 завершён.
 *
 * Дальше перенесём те же идеи в другую предметную область —
 * браузер и рендеринг уведомлений.
 */