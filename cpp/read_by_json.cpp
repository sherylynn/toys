#include "json/single_include/nlohmann/json.hpp"
#include <fstream>
#include <iostream>
#include <sstream>
int main() {
  using json = nlohmann::json;
  std::ifstream input("resolution.json");
  json j;
  input >> j;
  std::cout << j["default"] << std::endl;
  return 0;
}