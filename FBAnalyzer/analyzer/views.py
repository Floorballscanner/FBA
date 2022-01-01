"""
Views are rendered to form html - page
views.function returns a HttpResponse - that is the .html file content

"""

from django.http import HttpResponse
from django.shortcuts import render

def homepage(request):
    #return HttpResponse('Home')
    return render(request, 'index.html')

def login(request):
    return render(request, 'login.html')

def signup(request):
    return render(request, 'sign_up.html')
