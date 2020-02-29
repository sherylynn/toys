#include <stdio.h>
#include <malloc.h>
#include <conio.h>

int main(){
  int *a = (int *)malloc(sizeof(int)*4);
  a[0]=3;
  a[1]=2;
  a[2]=4;
  a[3]=1;
  free(a);
  _getch();
  return 0;
}
