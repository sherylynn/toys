#include <iostream>
#include <fstream>
using namespace std;

int main ()
{
  char data[1024];
  ifstream infile;
  infile.open("./resolution_one_line.txt");
  cout << "Reading from the file" << endl;

  infile >> data;
  cout << data << endl;

  infile >> data;
  cout << data << endl;
  // 关闭打开的文件
  infile.close();
  return 0;
}
