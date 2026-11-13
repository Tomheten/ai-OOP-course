/**
 * ============================================================
 * ЗАДАЧА 49. УДАЛЕНИЕ SWITCH
 * Блок 6. Полиморфизм для обработки файлов
 * ============================================================
 *
 * В Задаче 44 мы построили большой switch, который выбирал
 * импортер по формату. В Задачах 45–48 мы создали интерфейс
 * и три парсера. Теперь пришло время удалить switch.
 *
 * ЗАДАНИЕ:
 *   - Удали выбор по формату из клиентского кода.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. БЫЛО: КЛИЕНТ С ВЫБОРОМ
 * ============================================================
 * То, что было в Задаче 44.
 */
namespace BeforeRemoval {
  type Record = { id: number; name: string; value: number };

  class JsonImporter {
    import(content: string): Record[] {
      return JSON.parse(content);
    }
  }
  class CsvImporter {
    import(content: string): Record[] {
      const lines = content.trim().split("\n");
      return lines.slice(1).map((line) => {
        const [id, name, value] = line.split(",");
        return { id: Number(id), name: name.trim(), value: Number(value) };
      });
    }
  }
  class TxtImporter {
    import(content: string): Record[] {
      return content.trim().split("\n").map((line) => {
        const [id, name, value] = line.split("|");
        return { id: Number(id), name: name.trim(), value: Number(value) };
      });
    }
  }

  /** Клиент знает про ВСЕ форматы. */
  function importData(format: string, content: string): Record[] {
    if (format === "json") return new JsonImporter().import(content);
    else if (format === "csv") return new CsvImporter().import(content);
    else if (format === "txt") return new TxtImporter().import(content);
    throw new Error("Неизвестный формат: " + format);
  }

  console.log("[before] работает, но с выбором");
}

/**
 * ============================================================
 * ШАГ 2. СТАЛО: КЛИЕНТ ЧЕРЕЗ КОНТРАКТ
 * ============================================================
 */
namespace AfterRemoval {
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
  class TxtParser implements Parser {
    parse(content: string): Record[] {
      return content.trim().split("\n").map((line) => {
        const [id, name, value] = line.split("|");
        return { id: Number(id), name: name.trim(), value: Number(value) };
      });
    }
  }

  /**
   * Клиент принимает любой парсер.
   * Никакого выбора по формату.
   */
  function importData(parser: Parser, content: string): Record[] {
    return parser.parse(content);
  }

  const json = JSON.stringify([{ id: 1, name: "A", value: 1 }]);
  const csv = "id,name,value\n2,B,2";
  const txt = "3|C|3";

  console.log("[after] json:", importData(new JsonParser(), json));
  console.log("[after] csv:", importData(new CsvParser(), csv));
  console.log("[after] txt:", importData(new TxtParser(), txt));
}

/**
 * ============================================================
 * ШАГ 3. ПРОВЕРКИ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Клиент не знает про форматы
 * ----------------------------------------
 * Функция importData принимает Parser. Ей не важно, какой
 * конкретно парсер передан. Она просто вызывает метод контракта.
 */

/**
 * СИТУАЦИЯ 2. Нет ветвления
 * -------------------------
 * В клиенте нет ни одного if/switch по формату. Логика выбора
 * полностью ушла из клиента.
 */

/**
 * СИТУАЦИЯ 3. Кто выбирает парсер?
 * --------------------------------
 * Выбор конкретного парсера переместился на уровень выше — туда,
 * где создаётся клиентский код. Например, в точку входа, где
 * известно расширение файла.
 */

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 *
 * Мы удалили switch из клиента. Клиент работает через контракт
 * и не знает про конкретные форматы. Логика выбора переехала
 * на уровень выше — туда, где она и должна быть.
 *
 * Дальше сделаем добавление новых форматов ещё проще — через
 * плагин.
 */