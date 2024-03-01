"""
Views are rendered to form html - page
views.function returns a HttpResponse - that is the .html file content

"""

from django.shortcuts import render


def homepage(request):
    #return HttpResponse('Home')
    return render(request, 'index.html')

def login(request):
    return render(request, 'login.html')

def signup(request):
    return render(request, 'sign_up.html')

def about(request):
    return render(request, 'about.html')

def sitemap(request):
    return render(request, 'sitemap.txt')

def live(request):
    return render(request, 'live.html')

def game(request, nr):
    return render(request, 'game.html')

def references(request):
    return render(request, 'references.html')

def fliigalive(request):
    return render(request, 'f-liiga_live.html')

def fliigagame(request, nr):
    return render(request, 'f-liiga_game.html')

def fliiga_results(request):
    return render(request, 'f-liiga_results.html')

def fliiga_main(request):
    return render(request, 'f-liiga.html')

def inssidivari_main(request):
    return render(request, 'inssidivari.html')

def inssidivari_results(request):
    return render(request, 'inssidivari_results.html')

def inssidivarigame(request, nr):
    return render(request, 'inssidivari_game.html')

def inssidivarilive(request):
    return render(request, 'inssidivari_live.html')

def testilive(request):
    return render(request, 'testilive.html')

