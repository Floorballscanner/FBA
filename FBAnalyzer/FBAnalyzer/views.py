from django.http import HttpResponse
from django.shortcuts import render

def about(request):
    #return HttpResponse('about')
    return render(request, 'about.html')

def homepage(request):
    #return HttpResponse('Home')
    return render(request, 'index.html')

def contact(request):
    return render(request, 'contact.html')

def pricing(request):
    return render(request, 'pricing.html')

def login(request):
    return render(request, 'login.html')