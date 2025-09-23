from django.urls import path
from . import views

app_name = 'adminpanel'

urlpatterns = [
    path('', views.admin_dashboard, name='admin_dashboard'),
    path('models/', views.models_index, name='models_index'),
    path('models/<str:app_label>/<str:model_name>/', views.object_list, name='object_list'),
    path('models/<str:app_label>/<str:model_name>/add/', views.object_add, name='object_add'),
    path('models/<str:app_label>/<str:model_name>/<int:pk>/edit/', views.object_edit, name='object_edit'),
    path('models/<str:app_label>/<str:model_name>/<int:pk>/delete/', views.object_delete, name='object_delete'),
]


