/**
 * ============================================================
 * ЗАДАЧА 44. БОЛЬШОЙ SWITCH
 * Блок 6. Полиморфизм для обработки файлов
 * ============================================================
 *
 * В Задачах 41–43 мы создали три импортера. Теперь клиенту
 * нужен единый способ импортировать файл: он передаёт содержимое
 * и формат, а система разбирается.
 *
 * Самое очевидное решение — выбор через switch.
 *
 * ЗАДАНИЕ:
 *   - Сделай единую функцию импорта с выбором по формату.
 *
 * Читай файл сверху вниз. Запусти его и посмотри на вывод.
 */

/**
 * ============================================================
 * ШАГ 1. КЛИЕНТ С ВЫБОРОМ ПО ФОРМАТУ
 * ============================================================
 */
namespace BigSwitch {
  type Record = {
    id: number;
    name: string;
    value: number;
  };

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
      return content
        .trim()
        .split("\n")
        .map((line) => {
          const [id, name, value] = line.split("|");
          return { id: Number(id), name: name.trim(), value: Number(value) };
        });
    }
  }

  /** Единая точка входа. Выбор через ветвление. */
  function importData(format: string, content: string): Record[] {
    if (format === "json") {
      return new JsonImporter().import(content);
    } else if (format === "csv") {
      return new CsvImporter().import(content);
    } else if (format === "txt") {
      return new TxtImporter().import(content);
    }
    throw new Error("Неизвестный формат: " + format);
  }

  const jsonContent = JSON.stringify([{ id: 1, name: "Первый", value: 100 }]);
  const csvContent = "id,name,value\n2,Второй,200";
  const txtContent = "3|Третий|300";

  console.log("[switch] json:", importData("json", jsonContent));
  console.log("[switch] csv:", importData("csv", csvContent));
  console.log("[switch] txt:", importData("txt", txtContent));
}

/**
 * ============================================================
 * ШАГ 2. ПРОВЕРКИ НА ПРОЧНОСТЬ
 * ============================================================
 */

/**
 * СИТУАЦИЯ 1. Добавь новый формат
 * -------------------------------
 * Продукт просит поддержать XML. Что нужно сделать?
 *   1. Создать класс XmlImporter;
 *   2. Полезть в importData и добавить новую ветку.
 *
 * Каждый новый формат требует правки существующего кода.
 */

/**
 * СИТУАЦИЯ 2. Ветвление может расползтись
 * ---------------------------------------
 * Если выбор формата нужен не только в importData, а ещё в
 * паре мест (например, для валидации или логирования), ветвление
 * придётся дублировать.
 */

/**
 * СИТУАЦИЯ 3. Клиент знает слишком много
 * ---------------------------------------
 * Функция importData знает про ВСЕ форматы. Она знает про
 * JsonImporter, CsvImporter, TxtImporter. Если появится новый
 * формат, нужно менять и её.
 */

/**
 * СИТУАЦИЯ 4. Знакомая картина
 * ----------------------------
 * Мы уже видели это в Блоке 2 с уведомлениями. Там был
 * выбор между email и sms. Здесь — выбор между форматами.
 * Проблема та же: условная логика вместо абстракции.
 */

/**
 * ============================================================
 * ИТОГ
 * ============================================================
 *
 * Мы получили большой switch. Он работает, но каждая новая
 * ветка — это правка существующего кода и рост связанности.
 *
 * Дальше применим то, что мы уже знаем из Блока 2: введём
 * общий контракт — интерфейс.
 */