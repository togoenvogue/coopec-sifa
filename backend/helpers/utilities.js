export function sanitizeString(data) {
  if (data != null && data.length > 0) {
    let str = data;
    var str1 = str.replace("É", "E");
    var str2 = str1.replace("È", "");
    var str3 = str2.replace("é", "e");
    var str4 = str3.replace("è", "e");
    var str5 = str4.replace(",", "");
    var str6 = str5.replace(";", "");
    var str7 = str6.replace("\n", " ");
    var str8 = str7.replace("\t", " ");
    return str8;
  } else {
    return "";
  }
}
