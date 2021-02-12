#include "rapidjson/include/rapidjson/document.h"
#include "rapidjson/include/rapidjson/filereadstream.h"
#include <cstdio>
 
using namespace rapidjson;
 
FILE* fp = fopen("resolution.json", "r"); // 非 Windows 平台使用 "r",Windows is "rb"
 
char readBuffer[65536];
FileReadStream is(fp, readBuffer, sizeof(readBuffer));
 
Document document;
document.ParseStream(is);
 
fclose(fp);
