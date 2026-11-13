/**
 * ============================================================
 * ЗАДАЧА 48. TxtParser
 * Блок 6. Полиморфизм для обработки файлов
 * ============================================================
 *
 * В Задачах 46–47 мы разобрали два парсера. Здесь посмотрим на
 * третий — парсер TXT. После этого у нас будет полный набор, и
 * мы сможем окончательно удалить switch.
 *
 * ЗАДАНИЕ:
 *   - Разберись, как устроен TxtParser.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. РЕАЛИЗАЦИЯ
 * ============================================================
 */
namespace TxtParserImplementation {
  type Record = {
    id: number;
    name: string;
    value: number;
  };

  interface Parser {
    parse(content: string): Record[];
  }

  /**
   * TxtParser реализует контракт.
   * Он знает, как превратить текстовую строку с разделителем "|"
   * в массив записей.
   *
   * Формат:
   *   1|Первый|100
   *   2|Второй|200
   */
  class TxtParser implements Parser {
    parse(content: string): Record[] {
      return content
        .trim()
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [id, name, value] = line.split("|");
          return {
            id: Number(id),
            name: name.trim(),
            value: Number(value),
          };
        });
    }
  }

  const txtContent = `1|Первый|100
2|Второй|200
3|Третий|300`;

  const parser = new TxtParser();
  const records = parser.parse(txtContent);

  console.log("[txt-parser] записей:", records.length);
  console.log("[txt-parser] первая:", records[0]);
}

/**
 * ============================================================
 * ШАГ 2. ТРИ ПАРСЕРА РАБОТАЮТ ОДИНАКОВО
 * ============================================================
 */
namespace AllThreeTogether {
  type Record = {
    id: number;
    name: string;
    value: number;
  };

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
      return content
        .trim()
        .split("\n")
        .map((line) => {
          const [id, name, value] = line.split("|");
          return { id: Number(id), name: name.trim(), value: Number(value) };
        });
    }
  }

  /** Клиент работает через контракт. Никакого выбора по типу. */
  function processFile(parser: Parser, content: string): void {
    const records = parser.parse(content);
    console.log("[all] обработано записей:", records.length);
  }

  processFile(new JsonParser(), JSON.stringify([{ id: 1, name: "A", value: 1 }]));
  processFile(new CsvParser(), "id,name,value\n2,B,2");
  processFile(new TxtParser(), "3|C|3");
}

/**
 * ============================================================
 * ШАГ 3. ПРОВЕРКИ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Три класса, один контракт
 * -------------------------------------
 * У нас три парсера, и все реализуют интерфейс Parser. Клиент
 * может работать с любым из них одинаково.
 */

/**
 * СИТУАЦИЯ 2. Функция принимает любой парсер
 * ------------------------------------------
 * Функция processFile принимает Parser. Ей не важно, что именно
 * передано. Это и есть полиморфизм.
 */

/**
 * СИТУАЦИЯ 3. Новый формат — новый класс
 * ---------------------------------------
 * Если завтра нужно поддержать XML, мы создадим класс
 * XmlParser, который реализует Parser. Функцию processFile
 * менять не нужно.
 */

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 *
 * Три парсера реализуют один контракт. Клиент работает через
 * абстракцию. Это классический пример полиморфизма: разные
 * реализации используются одинаково.
 *
 * Дальше мы официально удалим switch и зафиксируем результат.
 */